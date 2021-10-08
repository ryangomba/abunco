import { intArg, nonNull, objectType, stringArg } from "nexus";
import { Context } from "../auth/context";
import {
  createProductVariant,
  deleteProductVariant,
  unarchiveProduct,
  updateProductVariant,
} from "../products/updateProduct";
import { ProductVariantNodeType } from "./graph/productVariantNode";

export const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.field("createProductVariant", {
      type: "ProductVariant",
      args: {
        vendorID: nonNull(stringArg()),
        productName: nonNull(stringArg()),
        productDescription: nonNull(stringArg()),
        productImageData: stringArg(),
        size: nonNull(stringArg()),
        cost: nonNull(stringArg()),
        price: nonNull(stringArg()),
        quantity: nonNull(intArg()),
      },
      resolve: (
        _,
        {
          vendorID,
          productName,
          productDescription,
          productImageData,
          size,
          cost,
          price,
          quantity,
        },
        ctx: Context
      ): Promise<ProductVariantNodeType> => {
        return createProductVariant(ctx, {
          vendorID,
          productName,
          productDescription,
          productImageData: productImageData || undefined,
          size,
          cost,
          price,
          quantity,
        });
      },
    });
    t.field("updateProductVariant", {
      type: "ProductVariant",
      args: {
        id: nonNull(stringArg()),
        productName: stringArg(),
        productDescription: stringArg(),
        productImageData: stringArg(),
        size: stringArg(),
        cost: stringArg(),
        price: stringArg(),
        quantity: intArg(),
      },
      resolve: (
        _,
        {
          id,
          productName,
          productDescription,
          productImageData,
          size,
          cost,
          price,
          quantity,
        },
        ctx: Context
      ): Promise<ProductVariantNodeType> => {
        return updateProductVariant(ctx, id, {
          productName: productName || undefined,
          productDescription: productDescription || undefined,
          productImageData,
          size: size || undefined,
          cost: cost || undefined,
          price: price || undefined,
          quantity: quantity === null ? undefined : quantity,
        });
      },
    });
    t.field("deleteProductVariant", {
      type: "Boolean",
      args: {
        productID: nonNull(stringArg()),
        id: nonNull(stringArg()),
      },
      resolve: async (_, { productID, id }, ctx: Context): Promise<boolean> => {
        await deleteProductVariant(ctx, productID, id);
        return true;
      },
    });
    t.field("unarchiveProduct", {
      type: "Boolean",
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_, { id }, ctx: Context): Promise<boolean> => {
        await unarchiveProduct(ctx, id);
        return true;
      },
    });
  },
});
