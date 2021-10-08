import { makeSchema } from "nexus";
import { ProductNode } from "./graph/productNode";
import { ProductVariantNode } from "./graph/productVariantNode";
import { StoreNode } from "./graph/storeNode";
import { VendorNode } from "./graph/vendorNode";
import { Mutation } from "./mutation";
import { Query } from "./query";

export const schema = makeSchema({
  types: [
    Query,
    Mutation,
    StoreNode,
    ProductNode,
    ProductVariantNode,
    VendorNode,
  ],
  outputs: {
    schema: __dirname + "/generated/schema.graphql",
    typegen: __dirname + "/generated/schema.d.ts",
  },
});
