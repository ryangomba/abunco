import { gql } from "@apollo/client";
import React from "react";
import { productVariantURL } from "../utils/urls";
import { InventorySelector } from "./InventorySelector";

export function ProductVariantListItem(props: Props) {
  const { inProductContext, productVariant } = props;
  const { id, name, displayName, price, size, cost, product, quantity } =
    productVariant;

  let priceString;
  if (!cost /* OR viewer is food hub */) {
    priceString = `$${price} retail`;
  } else {
    priceString = `$${cost}`;
  }
  if (!inProductContext && size) {
    priceString += " / " + size;
  }

  const faded = product.status === "archived" || quantity === 0;

  return (
    <div
      className={`flex flex-row items-start p-4 ${faded ? "opacity-50" : ""}`}
    >
      <a href={productVariantURL(id)}>
        <div
          className={`rounded-md w-16 h-16 ${
            inProductContext ? "" : "bg-gray-200"
          }`}
        >
          {product.imageURI && !inProductContext && (
            <img
              src={product.imageURI}
              alt={displayName}
              className="rounded-md object-cover h-full w-full"
            />
          )}
        </div>
      </a>
      <div className="ml-4 flex-1">
        <a href={productVariantURL(id)}>
          <div className="flex flex-row">
            <div className="flex-1">
              <p className={`${inProductContext ? "" : "text-lg"} font-bold`}>
                {inProductContext ? name : displayName}
              </p>
              <p className="text-sm">{priceString}</p>
            </div>
            <p className="text-xl">›</p>
          </div>
        </a>
        <InventorySelector
          className="py-4"
          productVariant={props.productVariant as any}
        />
      </div>
    </div>
  );
}

type Props = {
  inProductContext: boolean;
  productVariant: {
    id: string;
    name: string;
    displayName: string;
    size: string;
    price: string;
    cost: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      status: string;
      imageURI: string | null;
    };
  };
};

ProductVariantListItem.fragments = {
  productVariant: gql`
    fragment ProductVariantListItem_productVariant on ProductVariant {
      id
      name
      displayName
      size
      price
      cost
      quantity
      product {
        id
        name
        status
        imageURI
      }
      ...InventorySelector_productVariant
    }
    ${InventorySelector.fragments.productVariant}
  `,
};
