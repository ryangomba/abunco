import { nonNull, objectType } from "nexus";
import { Context } from "../../auth/context";
import { getProductVariantWithID } from "../../products/getProducts";
import { Product } from "../../products/types";
import { getStoreWithID } from "../../stores/getStores";
import { getVendorWithID } from "../../vendors/vendors";
import { ProductVariantNodeType } from "./productVariantNode";
import { StoreNodeType } from "./storeNode";
import { VendorNodeType } from "./vendorNode";

export type ProductNodeType = Product;

export const ProductNode = objectType({
  name: "Product",
  sourceType: {
    module: __filename,
    export: "ProductNodeType",
  },
  definition(t) {
    t.field("id", {
      type: nonNull("String"),
      resolve(n: ProductNodeType): string {
        return n.id;
      },
    });
    t.field("status", {
      type: nonNull("String"),
      resolve(n: ProductNodeType): string {
        return n.status;
      },
    });
    t.field("name", {
      type: nonNull("String"),
      resolve(n: ProductNodeType): string {
        return n.name;
      },
    });
    t.field("description", {
      type: nonNull("String"),
      resolve(n: ProductNodeType): string {
        return n.description;
      },
    });
    t.field("imageURI", {
      type: "String",
      resolve(n: ProductNodeType): string | null {
        return n.imageURI;
      },
    });
    t.field("store", {
      type: nonNull("Store"),
      resolve(n: ProductNodeType, _, ctx: Context): Promise<StoreNodeType> {
        return getStoreWithID(ctx, n.storeID);
      },
    });
    t.field("vendor", {
      type: nonNull("Vendor"),
      resolve(n: ProductNodeType, _, ctx: Context): Promise<VendorNodeType> {
        return getVendorWithID(ctx, n.vendorID);
      },
    });
    t.list.field("variants", {
      type: nonNull("ProductVariant"),
      resolve: async (
        n: ProductNodeType,
        _,
        ctx: Context
      ): Promise<ProductVariantNodeType[]> => {
        return Promise.all(
          n.variantIDs.map((vID) => getProductVariantWithID(ctx, vID))
        );
      },
    });
  },
});
