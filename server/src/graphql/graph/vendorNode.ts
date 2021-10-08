import { nonNull, objectType } from "nexus";
import { Context } from "../../auth/context";
import { getProductsForVendor } from "../../products/getProducts";
import { getStoreWithID } from "../../stores/getStores";
import { Vendor } from "../../vendors/types";
import { ProductNodeType } from "./productNode";
import { StoreNodeType } from "./storeNode";

export type VendorNodeType = Vendor;

export const VendorNode = objectType({
  name: "Vendor",
  sourceType: {
    module: __filename,
    export: "VendorNodeType",
  },
  definition(t) {
    t.field("id", {
      type: nonNull("String"),
      resolve(n: VendorNodeType): string {
        return n.id;
      },
    });
    t.field("name", {
      type: nonNull("String"),
      resolve(n: VendorNodeType): string {
        return n.name;
      },
    });
    t.field("store", {
      type: nonNull("Store"),
      resolve(n: VendorNodeType, _, ctx: Context): Promise<StoreNodeType> {
        return getStoreWithID(ctx, n.storeID);
      },
    });
    t.list.field("products", {
      type: nonNull("Product"),
      resolve: (
        n: VendorNodeType,
        _,
        ctx: Context
      ): Promise<ProductNodeType[]> => {
        return getProductsForVendor(ctx, n.id);
      },
    });
  },
});
