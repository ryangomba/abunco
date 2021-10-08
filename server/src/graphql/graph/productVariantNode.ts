import { nonNull, objectType } from "nexus";
import { Context } from "../../auth/context";
import {
  getInventoryItemWithID,
  getProductVariantUnit,
  getProductWithID,
} from "../../products/getProducts";
import { ProductVariant } from "../../products/types";
import { ProductNodeType } from "./productNode";

export type ProductVariantNodeType = ProductVariant;

export const ProductVariantNode = objectType({
  name: "ProductVariant",
  sourceType: {
    module: __filename,
    export: "ProductVariantNodeType",
  },
  definition(t) {
    t.field("id", {
      type: nonNull("String"),
      resolve(n: ProductVariantNodeType): string {
        return n.id;
      },
    });
    t.field("name", {
      type: nonNull("String"),
      resolve(n: ProductVariantNodeType): string {
        return n.name;
      },
    });
    t.field("displayName", {
      type: nonNull("String"),
      async resolve(
        n: ProductVariantNodeType,
        _,
        ctx: Context
      ): Promise<string> {
        const product = await getProductWithID(ctx, n.productID);
        let displayName = product.name;
        if (product.variantIDs.length > 1) {
          displayName += ` (${n.name})`;
        }
        return displayName;
      },
    });
    t.field("size", {
      type: "String",
      async resolve(
        n: ProductVariantNodeType,
        _,
        ctx: Context
      ): Promise<string | null> {
        const unit = await getProductVariantUnit(ctx, n.id);
        return unit.value;
      },
    });
    t.field("cost", {
      type: "String",
      async resolve(
        n: ProductVariantNodeType,
        _,
        ctx: Context
      ): Promise<string> {
        const inventoryItem = await getInventoryItemWithID(
          ctx,
          n.inventoryItemID
        );
        return inventoryItem.cost;
      },
    });
    t.field("price", {
      type: nonNull("String"),
      resolve(n: ProductVariantNodeType): string {
        return n.price;
      },
    });
    t.field("quantity", {
      type: nonNull("Int"),
      resolve(n: ProductVariantNodeType): number {
        return n.quantity;
      },
    });
    t.field("isDefault", {
      type: nonNull("Boolean"),
      async resolve(
        n: ProductVariantNodeType,
        _,
        ctx: Context
      ): Promise<boolean> {
        const product = await getProductWithID(ctx, n.productID);
        return product.variantIDs.length === 1;
      },
    });
    t.field("product", {
      type: nonNull("Product"),
      async resolve(
        n: ProductVariantNodeType,
        _,
        ctx: Context
      ): Promise<ProductNodeType> {
        return getProductWithID(ctx, n.productID);
      },
    });
  },
});
