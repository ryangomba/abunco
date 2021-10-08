import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { vendorURL } from "../utils/urls";
import ProductVariantForm, {
  formDataIsValid,
  ProductVariantFormData,
} from "./ProductVariantForm";

type Data = {
  store: {
    id: string;
    name: string;
  };
  productVariant: {
    id: string;
    name: string;
    size: string | null;
    displayName: string;
    cost: string | null;
    price: string;
    isDefault: boolean;
    quantity: number;
    product: {
      id: string;
      name: string;
      status: string;
      description: string;
      imageURI: string | null;
      vendor: {
        id: string;
        name: string;
      };
    };
  };
};

const QUERY = gql`
  query GetProductVariant($storeID: String!, $productVariantID: String!) {
    store(id: $storeID) {
      id
      name
    }
    productVariant(id: $productVariantID) {
      id
      name
      displayName
      size
      cost
      price
      quantity
      isDefault
      product {
        id
        name
        status
        description
        imageURI
        vendor {
          id
          name
        }
      }
    }
  }
`;

const UPDATE_PRODUCT_VARIANT = gql`
  mutation UpdateProductVariant(
    $id: String!
    $productName: String
    $productDescription: String
    $productImageData: String
    $size: String
    $cost: String
    $price: String
    $quantity: Int
  ) {
    updateProductVariant(
      id: $id
      productName: $productName
      productDescription: $productDescription
      productImageData: $productImageData
      cost: $cost
      size: $size
      price: $price
      quantity: $quantity
    ) {
      id
      name
      size
      displayName
      cost
      price
      quantity
      product {
        id
        name
        description
        imageURI
      }
    }
  }
`;

const DELETE_PRODUCT_VARIANT = gql`
  mutation DeleteProductVariant($productID: String!, $id: String!) {
    deleteProductVariant(productID: $productID, id: $id)
  }
`;
const UNARCHIVE_PRODUCT = gql`
  mutation UnarchiveProduct($id: String!) {
    unarchiveProduct(id: $id)
  }
`;

function ProductVariantView(props: { productVariant: Data["productVariant"] }) {
  const { productVariant } = props;
  const { product } = productVariant;
  const archived = product.status === "archived";
  const history = useHistory();

  const startingFormData: ProductVariantFormData = {
    imageURI: product.imageURI,
    imageData: null,
    productName: product.name,
    size: productVariant.size,
    cost: productVariant.cost,
    price: productVariant.price,
    quantity: productVariant.quantity,
    description: product.description,
  };
  const [formData, setFormData] = useState(startingFormData);
  const [saving, setSaving] = useState(false);

  const hasImageChange = formData.imageURI !== product.imageURI;
  const hasProductNameChange = formData.productName !== product.name;
  const hasProductDescriptionChange =
    formData.description !== product.description;
  const hasSizeChange = formData.size !== productVariant.size;
  const hasCostChange = formData.cost !== productVariant.cost;
  const hasPriceChange = formData.price !== productVariant.price;
  const hasQuantityChange = formData.quantity !== productVariant.quantity;
  const hasChanges =
    hasImageChange ||
    hasProductNameChange ||
    hasProductDescriptionChange ||
    hasSizeChange ||
    hasPriceChange ||
    hasCostChange ||
    hasQuantityChange;

  const canUpdate = hasChanges && formDataIsValid(formData, startingFormData);
  const [updateProductVariantMutation] = useMutation(UPDATE_PRODUCT_VARIANT);
  function updateProductVariant() {
    setSaving(true);
    updateProductVariantMutation({
      variables: {
        id: productVariant.id,
        productName: hasProductNameChange ? formData.productName : undefined,
        productDescription: hasProductDescriptionChange
          ? formData.description
          : undefined,
        productImageData: hasImageChange ? formData.imageData : undefined,
        size: hasSizeChange ? formData.size : undefined,
        cost: hasPriceChange ? formData.cost : undefined,
        price: hasPriceChange ? formData.price : undefined,
        quantity: hasQuantityChange ? formData.quantity : undefined,
      },
    }).then(({ data }) => {
      console.log("Received mutation response", data);
      setSaving(false);
      history.push(
        `${vendorURL(product.vendor.id)}?updated-product-variant-${
          productVariant.id
        }`
      );
    });
  }

  const [deleteProductVariantMutation] = useMutation(DELETE_PRODUCT_VARIANT);
  function deleteProductVariant() {
    setSaving(true);
    deleteProductVariantMutation({
      variables: {
        productID: product.id,
        id: productVariant.id,
      },
    }).then(({ data }) => {
      console.log("Received mutation response", data);
      setSaving(false);
      history.push(
        `${vendorURL(product.vendor.id)}?deleted-product-variant-${
          productVariant.id
        }`
      );
    });
  }
  function tryDeleteProductVariant() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (confirmed) {
      deleteProductVariant();
    }
  }

  const [unarchiveProductMutation] = useMutation(UNARCHIVE_PRODUCT);
  function unarchiveProduct() {
    setSaving(true);
    unarchiveProductMutation({
      variables: {
        id: product.id,
      },
    }).then(({ data }) => {
      console.log("Received mutation response", data);
      setSaving(false);
      history.push(
        `${vendorURL(product.vendor.id)}?unarchived-product-variant-${
          productVariant.id
        }`
      );
    });
  }

  return (
    <div>
      <Navbar
        showBackButton={true}
        right={
          <Button
            className="ml-4"
            onClick={saving ? undefined : () => updateProductVariant()}
            disabled={saving || !canUpdate}
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        }
      ></Navbar>
      <div className="mt-16 p-4 flex flex-col space-y-8">
        <ProductVariantForm
          data={formData}
          onChange={(data) => setFormData(data)}
        />
        {archived ? (
          <button className="text-purple-600" onClick={unarchiveProduct}>
            Unarchive
          </button>
        ) : (
          <button className="text-red-600" onClick={tryDeleteProductVariant}>
            {productVariant.isDefault ? "Archive" : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}

type Props = {
  //
};

export default function ProductVariantPage(props: Props) {
  let { storeID, productVariantID } =
    useParams<{ storeID: string; productVariantID: string }>();

  const { loading, error, data } = useQuery(QUERY, {
    variables: { storeID, productVariantID },
  });
  if (error) {
    console.log(error);
  }

  const productVariant = data?.productVariant;
  return (
    <div>
      {loading && <p className="flex h-16 p-4 items-center">Loading...</p>}
      {error && <p>Error :(</p>}
      {productVariant && <ProductVariantView productVariant={productVariant} />}
    </div>
  );
}
