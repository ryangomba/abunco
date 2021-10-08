import { Context } from "../auth/context";
import {
  createShopifyProduct,
  deleteShopifyProductVariant,
  getShopifyInventoryItemWithID,
  getShopifyProductVariantWithID,
  getShopifyProductWithID,
  setShopifyProductVariantUnitMetafield,
  ShopifyImageInfo,
  ShopifyInventoryItem,
  ShopifyProduct,
  ShopifyVariant,
  updateShopifyInventory,
  updateShopifyProduct,
  updateShopifyProductVariant,
} from "../shopify";
import {
  inventoryItemFromShopifyInventoryItem,
  productFromShopifyProduct,
  productVariantFromShopifyProductVariant,
} from "./getProducts";
import { ProductVariant } from "./types";

export async function createProductVariant(
  ctx: Context,
  info: {
    vendorID: string;
    productName: string;
    productDescription: string;
    productImageData?: string;
    size: string;
    cost: string;
    price: string;
    quantity: number;
  }
): Promise<ProductVariant> {
  let options: { name: string; values: string[] }[] | undefined;

  const shopifyProduct = await createShopifyProduct(ctx.shopifyInfo, {
    title: info.productName,
    body_html: info.productDescription,
    vendor: info.vendorID,
    images: info.productImageData
      ? [
          {
            attachment: attachmentDataForBase64ImageData(info.productImageData),
          },
        ]
      : [],
    options: [
      {
        name: "Size",
        values: [info.size],
      },
    ],
    variants: [
      {
        price: info.price,
        inventory_management: "shopify",
        metafields: [
          {
            namespace: "abunco",
            key: "unit",
            value: info.size,
            type: "single_line_text_field",
          },
        ],
      },
    ],
  });
  let shopifyVariant = shopifyProduct.variants[0];
  await updateShopifyInventory(
    ctx.shopifyInfo,
    `${shopifyVariant.inventory_item_id}`,
    {
      cost: info.cost,
      quantity: info.quantity,
    }
  );
  return productVariantFromShopifyProductVariant(shopifyVariant);
}

export async function updateProductVariant(
  ctx: Context,
  id: string,
  updates: {
    productName?: string;
    productDescription?: string;
    productImageData?: string | null;
    productOptions?: string[];
    size?: string;
    cost?: string;
    price?: string;
    quantity?: number;
  }
): Promise<ProductVariant> {
  let shopifyProduct: ShopifyProduct | undefined;
  let shopifyVariant: ShopifyVariant | undefined;
  let shopifyInventoryItem: ShopifyInventoryItem | undefined;
  if (updates.price) {
    shopifyVariant = await updateShopifyProductVariant(ctx.shopifyInfo, id, {
      price: updates.price,
    });
  } else {
    shopifyVariant = await getShopifyProductVariantWithID(ctx.shopifyInfo, id);
  }
  if (updates.size) {
    await setShopifyProductVariantUnitMetafield(
      ctx.shopifyInfo,
      id,
      updates.size
    );
  }
  if (updates.cost || updates.quantity !== undefined) {
    shopifyInventoryItem = await updateShopifyInventory(
      ctx.shopifyInfo,
      `${shopifyVariant.inventory_item_id}`,
      {
        cost: updates.cost,
        quantity: updates.quantity,
      }
    );
    shopifyVariant = await getShopifyProductVariantWithID(ctx.shopifyInfo, id);
  }
  const productVariant =
    productVariantFromShopifyProductVariant(shopifyVariant);
  ctx.recordCache.cache(productVariant);
  if (
    updates.productName ||
    updates.productDescription ||
    updates.productImageData !== undefined
  ) {
    const productID = shopifyVariant.product_id.toString();
    let images: ShopifyImageInfo[] | undefined;
    if (updates.productImageData !== undefined) {
      shopifyProduct = await getShopifyProductWithID(
        ctx.shopifyInfo,
        productID
      );
      // Remove existing image
      images = shopifyProduct.images
        .slice(1)
        .map((image) => ({ id: image.id.toString() }));
      // Replace if we have new image data
      if (updates.productImageData) {
        images.unshift({
          attachment: attachmentDataForBase64ImageData(
            updates.productImageData
          ),
        });
      }
    }
    shopifyProduct = await updateShopifyProduct(ctx.shopifyInfo, productID, {
      title: updates.productName,
      body_html: updates.productDescription?.replaceAll("\n", "<br/>"),
      images,
    });
  }
  if (!shopifyProduct) {
    shopifyProduct = await getShopifyProductWithID(
      ctx.shopifyInfo,
      shopifyVariant.product_id.toString()
    );
  }
  ctx.recordCache.cache(productFromShopifyProduct(shopifyProduct));
  if (!shopifyInventoryItem) {
    shopifyInventoryItem = await getShopifyInventoryItemWithID(
      ctx.shopifyInfo,
      shopifyVariant.inventory_item_id.toString()
    );
  }
  ctx.recordCache.cache(
    inventoryItemFromShopifyInventoryItem(shopifyInventoryItem)
  );
  return productVariant;
}

export async function deleteProductVariant(
  ctx: Context,
  productID: string,
  id: string
): Promise<void> {
  const shopifyProduct = await getShopifyProductWithID(
    ctx.shopifyInfo,
    productID
  );
  if (
    shopifyProduct.variants.length === 1 &&
    shopifyProduct.variants[0].id.toString() === id
  ) {
    // deleteShopifyProduct(ctx.shopifyInfo, productID);
    updateShopifyProduct(ctx.shopifyInfo, productID, {
      status: "archived",
    });
  } else {
    deleteShopifyProductVariant(ctx.shopifyInfo, productID, id);
  }
}

export async function unarchiveProduct(
  ctx: Context,
  id: string
): Promise<void> {
  updateShopifyProduct(ctx.shopifyInfo, id, {
    status: "active",
  });
}

function attachmentDataForBase64ImageData(imageData: string): string {
  return imageData.replace(/(.+),(.+)/g, "$2");
}
