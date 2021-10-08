import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { ProductListItem } from "../components/ProductListItem";
import { ProductVariantListItem } from "../components/ProductVariantListItem";

export default function VendorPage(props: {}) {
  let { storeID, vendorID } =
    useParams<{ storeID: string; vendorID: string }>();

  const { loading, error, data } = useQuery(QUERY, {
    variables: { storeID, vendorID },
  });
  if (error) {
    console.log(error);
  }

  let [showArchived, setShowArchived] = useState(false);

  function renderVendor(data: Data) {
    const { store, vendor } = data;
    const allProducts = [...vendor.products].sort((p1, p2) => {
      return p1.status.localeCompare(p2.status);
    });
    const activeProducts = allProducts.filter((p) => p.status === "active");
    const archivedProducts = allProducts.filter((p) => p.status === "archived");

    function renderProduct(product: Product) {
      return (
        <div>
          {product.variants.length > 1 && (
            <ProductListItem key={product.id} product={product as any} />
          )}
          {product.variants.map((productVariant) => {
            return (
              <ProductVariantListItem
                key={productVariant.id}
                inProductContext={!productVariant.isDefault}
                productVariant={productVariant as any}
              />
            );
          })}
        </div>
      );
    }

    return (
      <div className="relative">
        <Navbar title={`Inventory for ${store.name}`} />
        <div className="mt-16"></div>
        <div className="px-4 py-8">
          <h2 className="font-semibold mb-1">{vendor.name}</h2>
          <h1 className="text-2xl font-bold mb-1">What’s for sale?</h1>
          {/*<p className="text-sm">Update inventory by 6pm today</p>*/}
        </div>
        <div /*className="border-t border-b divide-y"*/>
          {activeProducts.map(renderProduct)}
        </div>
        <div className="flex p-8 justify-center">
          <Link to={(location) => `${location.pathname}/new-product`}>
            <Button>Add item</Button>
          </Link>
        </div>
        {showArchived && (
          <div>
            <div className="px-4 py-8 text-center">
              <h2 className="text-xl font-bold mb-1">Archived products</h2>
              <button
                className="text-purple-600 text-sm font-semibold"
                onClick={() => setShowArchived(false)}
              >
                Hide
              </button>
            </div>
            {archivedProducts.map(renderProduct)}
          </div>
        )}
        {!showArchived && archivedProducts.length > 0 && (
          <div className="flex p-8 justify-center">
            <button
              className="text-purple-600 text-sm font-semibold"
              onClick={() => setShowArchived(true)}
            >
              {`Show archived (${archivedProducts.length})`}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {loading && <p className="flex h-16 p-4 items-center">Loading...</p>}
      {error && <p>Error :(</p>}
      {data && renderVendor(data)}
    </div>
  );
}

type Product = {
  id: string;
  name: string;
  status: string;
  variants: {
    id: string;
    isDefault: boolean;
  }[];
};

type Data = {
  store: {
    id: string;
    name: string;
  };
  vendor: {
    id: string;
    name: string;
    products: Product[];
  };
};

const QUERY = gql`
  query GetVendor($storeID: String!, $vendorID: String!) {
    store(id: $storeID) {
      id
      name
    }
    vendor(id: $vendorID) {
      id
      name
      products {
        id
        name
        status
        variants {
          id
          isDefault
          ...ProductVariantListItem_productVariant
        }
        ...ProductListItem_product
      }
    }
  }
  ${ProductListItem.fragments.product}
  ${ProductVariantListItem.fragments.productVariant}
`;
