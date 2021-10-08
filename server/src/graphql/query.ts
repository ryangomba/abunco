import { nonNull, objectType, stringArg } from "nexus";
import {
  getProductVariantWithID,
  getProductWithID,
} from "../products/getProducts";
import { getStoreWithID } from "../stores/getStores";
import { getVendorWithID } from "../vendors/vendors";
import { ProductNodeType } from "./graph/productNode";
import { ProductVariantNodeType } from "./graph/productVariantNode";
import { StoreNodeType } from "./graph/storeNode";
import { VendorNodeType } from "./graph/vendorNode";

export const Query = objectType({
  name: "Query",
  definition(t) {
    t.field("store", {
      type: nonNull("Store"),
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, { id }, ctx): Promise<StoreNodeType> => {
        return getStoreWithID(ctx, id);
      },
    });
    t.field("vendor", {
      type: nonNull("Vendor"),
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, { id }, ctx): Promise<VendorNodeType> => {
        return getVendorWithID(ctx, id);
      },
    });
    t.field("product", {
      type: nonNull("Product"),
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, { id }, ctx): Promise<ProductNodeType> => {
        return getProductWithID(ctx, id);
      },
    });
    t.field("productVariant", {
      type: nonNull("ProductVariant"),
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, { id }, ctx): Promise<ProductVariantNodeType> => {
        return getProductVariantWithID(ctx, id);
      },
    });
  },
});
