import { nonNull, objectType } from "nexus";
import { Context } from "../../auth/context";
import { Store } from "../../stores/types";
import { getVendorsForStore } from "../../vendors/vendors";
import { VendorNodeType } from "./vendorNode";

export type StoreNodeType = Store;

export const StoreNode = objectType({
  name: "Store",
  sourceType: {
    module: __filename,
    export: "StoreNodeType",
  },
  definition(t) {
    t.field("id", {
      type: nonNull("String"),
      resolve(n: StoreNodeType): string {
        return n.id;
      },
    });
    t.field("name", {
      type: nonNull("String"),
      resolve(n: StoreNodeType): string {
        return n.name;
      },
    });
    t.list.field("vendors", {
      type: nonNull("Vendor"),
      resolve: (
        n: StoreNodeType,
        _,
        ctx: Context
      ): Promise<VendorNodeType[]> => {
        return getVendorsForStore(ctx, n.id);
      },
    });
  },
});
