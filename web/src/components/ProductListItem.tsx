import { gql } from "@apollo/client";
import React from "react";

export function ProductListItem(props: Props) {
  const { name, status, imageURI } = props.product;
  const faded = status === "archived";

  return (
    <div
      className={`flex flex-row items-start p-4 ${faded ? "opacity-50" : ""}`}
    >
      <div className="rounded-md w-16 h-16 bg-gray-200">
        {imageURI && (
          <img
            src={imageURI}
            alt={name}
            className="rounded-md object-cover h-full w-full"
          />
        )}
      </div>
      <div className="ml-4 flex-1">
        <div className="flex flex-row h-16 items-center">
          <div className="flex-1">
            <p className="text-lg font-bold">{name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  product: {
    id: string;
    name: string;
    status: string;
    imageURI: string | null;
  };
};

ProductListItem.fragments = {
  product: gql`
    fragment ProductListItem_product on Product {
      id
      name
      status
      imageURI
    }
  `,
};
