import { gql, useMutation } from "@apollo/client";
import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { vendorURL } from "../utils/urls";
import ProductVariantForm, {
  formDataIsValid,
  ProductVariantFormData,
} from "./ProductVariantForm";

const CREATE_PRODUCT_VARIANT = gql`
  mutation CreateProductVariant(
    $vendorID: String!
    $productName: String!
    $productDescription: String!
    $productImageData: String
    $size: String!
    $cost: String!
    $price: String!
    $quantity: Int!
  ) {
    createProductVariant(
      vendorID: $vendorID
      productName: $productName
      productDescription: $productDescription
      productImageData: $productImageData
      size: $size
      cost: $cost
      price: $price
      quantity: $quantity
    ) {
      id
    }
  }
`;

export default function NewProductPage(props: {}) {
  let { vendorID } = useParams<{ vendorID: string }>();
  const history = useHistory();

  const startingFormData: ProductVariantFormData = {
    imageURI: null,
    imageData: null,
    productName: "",
    size: "",
    cost: "",
    price: "",
    quantity: 0,
    description: "",
  };
  const [formData, setFormData] = useState(startingFormData);
  const [saving, setSaving] = useState(false);

  const canCreate = formDataIsValid(formData);
  const [createProductVariantMutation] = useMutation(CREATE_PRODUCT_VARIANT);
  function createProductVariant() {
    setSaving(true);
    createProductVariantMutation({
      variables: {
        vendorID,
        productName: formData.productName,
        productDescription: formData.description,
        productImageData: formData.imageData,
        size: formData.size,
        cost: formData.cost,
        price: formData.price,
        quantity: formData.quantity,
      },
    }).then(({ data }) => {
      console.log("Received mutation response", data);
      setSaving(false);
      history.push(
        `${vendorURL(vendorID)}?new-product-variant-${
          data.createProductVariant.id
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
            onClick={saving ? undefined : () => createProductVariant()}
            disabled={!canCreate || saving}
          >
            {saving ? "Saving..." : "Add item"}
          </Button>
        }
      />
      <div className="mt-16 p-4 flex flex-col space-y-8">
        <ProductVariantForm
          data={formData}
          onChange={(data) => setFormData(data)}
        />
      </div>
    </div>
  );
}
