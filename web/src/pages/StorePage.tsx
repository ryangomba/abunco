import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { VendorListItem } from "../components/VendorListItem";

const QUERY = gql`
  query GetStore($id: String!) {
    store(id: $id) {
      id
      name
      vendors {
        id
        name
      }
    }
  }
`;

type Data = {
  store: {
    id: string;
    name: string;
    vendors: {
      id: string;
      name: string;
    }[];
  };
};

type Props = {
  //
};

export default function HomePage(props: Props) {
  let { storeID } = useParams<{ storeID: string }>();

  const { loading, error, data } = useQuery<Data>(QUERY, {
    variables: { id: storeID },
  });
  if (error) {
    console.log(error);
  }

  function renderStore(store: Data["store"]) {
    return (
      <div>
        <Navbar title={`${store.name} vendors`} />
        <div className="mb-16"></div>
        <div /*className="border-t border-b divide-y"*/>
          {store.vendors.map((vendor) => (
            <VendorListItem key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </div>
    );
  }

  const store = data?.store;
  return (
    <div>
      {loading && <p className="flex h-16 p-4 items-center">Loading...</p>}
      {error && <p>Error :(</p>}
      {store && renderStore(store)}
    </div>
  );
}
