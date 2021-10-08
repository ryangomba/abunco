import React from "react";
import { vendorURL } from "../utils/urls";

type Props = {
  vendor: {
    id: string;
    name: string;
  }; // Vendor;
};

export function VendorListItem(props: Props) {
  const { id, name } = props.vendor;
  return (
    <a href={vendorURL(id)}>
      <div className="px-4 py-2">
        <p>{name}</p>
      </div>
    </a>
  );
}
