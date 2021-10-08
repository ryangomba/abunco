import { convert } from "html-to-text";
import { Context } from "../auth/context";
import {
  getShopifyInventoryItemsWithIDs,
  getShopifyInventoryItemWithID,
  getShopifyMetafieldsForProductVariants,
  getShopifyProducts,
  getShopifyProductVariantWithID,
  getShopifyProductWithID,
  ShopifyInventoryItem,
  ShopifyMetafield,
  ShopifyProduct,
  ShopifyVariant,
} from "../shopify";
import {
  InventoryItem,
  Product,
  ProductStatus,
  ProductVariant,
  ProductVariantUnit,
} from "./types";

export async function getProductWithID(
  ctx: Context,
  productID: string
): Promise<Product> {
  const cachedRecord = ctx.recordCache.get(productID);
  if (cachedRecord) {
    return cachedRecord as Product;
  }
  const shopifyProduct = await getShopifyProductWithID(
    ctx.shopifyInfo,
    productID
  );
  let product = productFromShopifyProduct(shopifyProduct);
  {
    await cacheProductBundlesForShopifyProducts(ctx, [shopifyProduct]);
  }
  ctx.recordCache.cache(product);
  return product;
}

async function cacheProductBundlesForShopifyProducts(
  ctx: Context,
  shopifyProducts: ShopifyProduct[]
) {
  /* cache variants */ {
    shopifyProducts.forEach((shopifyProduct) => {
      const variants = shopifyProduct.variants.map(
        productVariantFromShopifyProductVariant
      );
      ctx.recordCache.cacheMany(variants);
    });
  }
  /* cache metafields */ {
    const variantIDs: string[] = [];
    shopifyProducts.forEach((p) => {
      p.variants.forEach((v) => {
        variantIDs.push(`${v.id}`);
      });
    });
    const shopifyMetafields = await getShopifyMetafieldsForProductVariants(
      ctx.shopifyInfo!,
      variantIDs
    );
    let productVariantUnits: ProductVariantUnit[] = [];
    variantIDs.forEach((productVariantID) => {
      const productVariantUnit = productVariantUnitFromShopifyMetafields(
        productVariantID,
        shopifyMetafields
      );
      productVariantUnits.push(productVariantUnit);
    });
    ctx.recordCache.cacheMany(productVariantUnits);
  }
  /* cache inventory items */ {
    const inventoryItemIDs: string[] = [];
    shopifyProducts.forEach((p) => {
      p.variants.forEach((v) => {
        inventoryItemIDs.push(`${v.inventory_item_id}`);
      });
    });
    const shopifyInventoryItems = await getShopifyInventoryItemsWithIDs(
      ctx.shopifyInfo!,
      inventoryItemIDs
    );
    const inventoryItems = shopifyInventoryItems.map(
      inventoryItemFromShopifyInventoryItem
    );
    ctx.recordCache.cacheMany(inventoryItems);
  }
}

export async function getProductsForVendor(
  ctx: Context,
  vendorID: string
): Promise<Product[]> {
  const shopifyProducts = await getShopifyProducts(ctx.shopifyInfo, {
    vendorName: vendorID,
  });
  let products = shopifyProducts.map(productFromShopifyProduct);
  {
    await cacheProductBundlesForShopifyProducts(ctx, shopifyProducts);
  }
  ctx.recordCache.cacheMany(products);
  return products;
}

export async function getProductVariantWithID(
  ctx: Context,
  productVariantID: string
): Promise<ProductVariant> {
  const cachedRecord = ctx.recordCache.get(productVariantID);
  if (cachedRecord) {
    return cachedRecord as ProductVariant;
  }
  const shopifyVariant = await getShopifyProductVariantWithID(
    ctx.shopifyInfo,
    productVariantID
  );
  let variant = productVariantFromShopifyProductVariant(shopifyVariant);
  /* cache product */ {
    await getProductWithID(ctx, variant.productID);
  }
  ctx.recordCache.cache(variant);
  return variant;
}

export async function getInventoryItemWithID(
  ctx: Context,
  inventoryItemID: string
): Promise<InventoryItem> {
  const cachedRecord = ctx.recordCache.get(inventoryItemID);
  if (cachedRecord) {
    return cachedRecord as InventoryItem;
  }
  const shopifyInventoryItem = await getShopifyInventoryItemWithID(
    ctx.shopifyInfo,
    inventoryItemID
  );
  let inventoryItem =
    inventoryItemFromShopifyInventoryItem(shopifyInventoryItem);
  ctx.recordCache.cache(inventoryItem);
  return inventoryItem;
}

function unitMetaFieldIDForProductVariantID(productVariantID: string): string {
  return `${productVariantID}.unit`;
}

function productVariantUnitFromShopifyMetafields(
  productVariantID: string,
  shopifyMetafields: ShopifyMetafield[]
): ProductVariantUnit {
  const productVariantUnits = shopifyMetafields
    .filter((m) => `${m.owner_id}` === productVariantID)
    .filter((m) => m.key === "unit")
    .map(productVariantUnitFromShopifyMetafield);
  if (productVariantUnits.length > 0) {
    return productVariantUnits[0];
  } else {
    return {
      id: unitMetaFieldIDForProductVariantID(productVariantID),
      value: null,
    };
  }
}

export async function getProductVariantUnit(
  ctx: Context,
  productVariantID: string
): Promise<ProductVariantUnit> {
  const metafieldID = unitMetaFieldIDForProductVariantID(productVariantID);
  const cachedRecord = ctx.recordCache.get(metafieldID);
  if (cachedRecord) {
    return cachedRecord as ProductVariantUnit;
  }
  const shopifyMetafields = await getShopifyMetafieldsForProductVariants(
    ctx.shopifyInfo,
    [productVariantID]
  );
  const productVariantUnit = productVariantUnitFromShopifyMetafields(
    productVariantID,
    shopifyMetafields
  );
  ctx.recordCache.cache(productVariantUnit);
  return productVariantUnit;
}

export function productFromShopifyProduct(p: ShopifyProduct): Product {
  const description = convert(p.body_html, { wordwrap: false })
    .replace(/\n{2,}/g, "\n\n")
    .replace(/\n+$/g, "");
  return {
    id: `${p.id}`,
    storeID: "123",
    vendorID: p.vendor,
    createdAt: new Date(p.created_at),
    name: p.title,
    status: p.status as ProductStatus,
    description,
    imageURI: p.image?.src || null,
    variantIDs: p.variants.map((v) => `${v.id}`),
  };
}

export function productVariantFromShopifyProductVariant(
  v: ShopifyVariant
): ProductVariant {
  return {
    id: `${v.id}`,
    createdAt: new Date(v.created_at),
    productID: `${v.product_id}`,
    name: v.title,
    price: v.price,
    quantity: v.inventory_quantity,
    inventoryItemID: `${v.inventory_item_id}`,
  };
}

export function inventoryItemFromShopifyInventoryItem(
  i: ShopifyInventoryItem
): InventoryItem {
  return {
    id: `${i.id}`,
    cost: i.cost,
  };
}

export function productVariantUnitFromShopifyMetafield(
  m: ShopifyMetafield
): ProductVariantUnit {
  if (m.key !== "unit") {
    throw new Error(`Expected metafield to have key of 'unit', found ${m.key}`);
  }
  return {
    id: unitMetaFieldIDForProductVariantID(`${m.owner_id}`),
    value: m.value,
  };
}
