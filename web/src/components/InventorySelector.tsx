import { gql, useMutation } from "@apollo/client";
import React, { useState } from "react";
import { AmountSelector } from "./AmountSelector";

const UPDATE_PRODUCT_VARIANT = gql`
  mutation UpdateProductVariant($id: String!, $quantity: Int) {
    updateProductVariant(id: $id, quantity: $quantity) {
      id
      quantity
    }
  }
`;

export function InventorySelector(props: Props) {
  const { id, quantity } = props.productVariant;
  const [updateProductVariant] = useMutation(UPDATE_PRODUCT_VARIANT);
  const [formQuantity, setFormQuantity] = useState(quantity);
  const [timeoutHandle, setTimoutHandle] = useState<NodeJS.Timeout | null>(
    null
  );

  function doUpdateProductVariant(newQuantity: number) {
    console.log("Updating quantity", newQuantity);
    updateProductVariant({
      variables: {
        id,
        quantity: newQuantity,
      },
    });
  }
  function updateQuantity(newQuantity: number) {
    console.log("Preparing to update quantity", newQuantity);
    setFormQuantity(newQuantity);
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
    setTimoutHandle(
      setTimeout(() => {
        doUpdateProductVariant(newQuantity);
      }, 500)
    );
  }

  return (
    <AmountSelector
      className={props.className}
      value={formQuantity}
      onChange={(value) => updateQuantity(value)}
    />
  );
}

type Props = {
  className?: string;
  productVariant: {
    id: string;
    quantity: number;
  };
};

InventorySelector.fragments = {
  productVariant: gql`
    fragment InventorySelector_productVariant on ProductVariant {
      id
      quantity
    }
  `,
};
