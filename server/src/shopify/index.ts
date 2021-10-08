import { ApiVersion } from "@shopify/shopify-api";
import fetch, { Response } from "node-fetch";

export type ShopifyAuthInfo = {
  storeSlug: string;
  apiKey: string;
  apiSecretKey: string;
  locationID: string;
  writesEnabled: boolean;
};

const API_VERSION = ApiVersion.July21;

function REST_URI(authInfo: ShopifyAuthInfo): string {
  return `https://${authInfo.storeSlug}.myshopify.com/admin/api/${API_VERSION}`;
}

function RESTHeaders(authInfo: ShopifyAuthInfo): { [key: string]: string } {
  return {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": authInfo.apiSecretKey,
  };
}

async function parseJSONResponse<T = any>(response: Response): Promise<T> {
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw new Error(`Shopify error: ${JSON.stringify(data)}`);
  }
}

function graphQLURI(authInfo: ShopifyAuthInfo): string {
  return `https://${authInfo.storeSlug}.myshopify.com/admin/api/${API_VERSION}/graphql.json`;
}

function graphQLHeaders(authInfo: ShopifyAuthInfo): { [key: string]: string } {
  return {
    "Content-Type": "application/graphql",
    "X-Shopify-Access-Token": authInfo.apiSecretKey,
  };
}

export type ShopifyInventoryItem = {
  id: number;
  cost: string;
  sku: string;
  tracked: boolean;
  requires_shipping: boolean;
  created_at: string;
  updated_at: string;
};

export type ShopifyVariant = {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string | null;
  position: number;
  inventory_policy: string; // deny |
  compare_at_price: string | null;
  fulfillment_service: string; // manual |
  inventory_management: string; // shopify |
  option1: string;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string;
  grams: number;
  image_id: number | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
};

export type ShopifyOption = {
  id: string;
  product_id: string;
  name: string;
  position: number;
  values: string[];
};

export type ShopifyImage = {
  id: number;
  product_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
};

export type ShopifyProduct = {
  id: number;
  title: string;
  body_html: string;
  vendor: string; // can be empty
  product_type: string; // can be empty
  created_at: string; // e.g. 2021-09-28T12:54:22-07:00
  handle: string;
  updated_at: string; // e.g. 2021-09-28T12:54:22-07:00
  published_at: string; // e.g. 2021-09-28T12:54:22-07:00
  template_suffix: string; // can be empty
  status: string; // active |
  published_scope: string; // web |
  tags: string; // comma separated
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
};

export type ShopifyMetafield = {
  namespace: string;
  key: string;
  value: any;
  owner_id: number;
};

export async function getShopifyProductVendors(
  authInfo: ShopifyAuthInfo
): Promise<string[]> {
  const response = await fetch(graphQLURI(authInfo), {
    method: "POST",
    headers: graphQLHeaders(authInfo),
    body: `
      query ProductVendors {
        shop {
          productVendors(first: 100) {
            edges {
              node
            }
          }
        }
      }
    `,
  });
  const { data } = await parseJSONResponse(response);
  const vendors = data.shop.productVendors.edges.map((e: any) => e.node);
  console.log("GET vendors", vendors);
  return vendors;
}

export async function getShopifyProducts(
  authInfo: ShopifyAuthInfo,
  params: {
    vendorName?: string;
  }
): Promise<ShopifyProduct[]> {
  let url = `${REST_URI(authInfo)}/products.json`;
  if (params.vendorName) {
    url += `?vendor=${encodeURIComponent(params.vendorName)}`;
  }
  const response = await fetch(url, {
    method: "GET",
    headers: RESTHeaders(authInfo),
  });
  const { products } = await parseJSONResponse<{ products: ShopifyProduct[] }>(
    response
  );
  console.log("GET products", JSON.stringify(products, null, 2));
  return products;
}

export async function getShopifyProductWithID(
  authInfo: ShopifyAuthInfo,
  id: string
): Promise<ShopifyProduct> {
  const response = await fetch(`${REST_URI(authInfo)}/products/${id}.json`, {
    method: "GET",
    headers: RESTHeaders(authInfo),
  });
  const { product } = await parseJSONResponse(response);
  console.log("GET product", JSON.stringify(product, null, 2));
  return product;
}

export async function getShopifyProductVariantWithID(
  authInfo: ShopifyAuthInfo,
  id: string
): Promise<ShopifyVariant> {
  const response = await fetch(`${REST_URI(authInfo)}/variants/${id}.json`, {
    method: "GET",
    headers: RESTHeaders(authInfo),
  });
  const { variant } = await parseJSONResponse(response);
  console.log("GET variant", JSON.stringify(variant, null, 2));
  return variant;
}

export async function getShopifyInventoryItemWithID(
  authInfo: ShopifyAuthInfo,
  id: string
): Promise<ShopifyInventoryItem> {
  const response = await fetch(
    `${REST_URI(authInfo)}/inventory_items/${id}.json`,
    {
      method: "GET",
      headers: RESTHeaders(authInfo),
    }
  );
  const { inventory_item } = await parseJSONResponse(response);
  console.log("GET inventory_item", JSON.stringify(inventory_item, null, 2));
  return inventory_item;
}

export async function getShopifyInventoryItemsWithIDs(
  authInfo: ShopifyAuthInfo,
  ids: string[]
): Promise<ShopifyInventoryItem[]> {
  const limit = 250;
  if (ids.length > limit) {
    throw new Error(
      `Can get max 250 inventory items at a time, requested ${ids.length}`
    );
  }
  const url = `${REST_URI(
    authInfo
  )}/inventory_items.json?limit=${limit}&ids=${encodeURIComponent(
    ids.join(",")
  )}`;
  const response = await fetch(url, {
    method: "GET",
    headers: RESTHeaders(authInfo),
  });
  const { inventory_items } = await parseJSONResponse(response);
  console.log("GET inventory_items", JSON.stringify(inventory_items, null, 2));
  return inventory_items;
}

export async function getShopifyMetafieldsForProductVariants(
  authInfo: ShopifyAuthInfo,
  ids: string[]
): Promise<ShopifyMetafield[]> {
  if (ids.length > 100) {
    throw new Error(
      `Can get max 100 metafield items at a time, requested ${ids.length}`
    );
  }
  let query = `query ProductVariantUnits {`;
  ids.forEach((id) => {
    query += `
      productVariant${id}: productVariant(id: "gid://shopify/ProductVariant/${id}") {
        displayName
        metafields(
          namespace: "abunco",
          first: 1
        ) {
          edges {
            node {
              key
              value
            }
          }
        }
      }
    `;
  });
  query += "}";
  const response = await fetch(graphQLURI(authInfo), {
    method: "POST",
    headers: graphQLHeaders(authInfo),
    body: query,
  });
  const { data } = await parseJSONResponse(response);
  let metafields: ShopifyMetafield[] = [];
  ids.forEach((id) => {
    const variantMetafields = data[`productVariant${id}`].metafields.edges
      .map((e: any) => e.node)
      .filter((m: any) => m.key === "unit")
      .map((m: any) => {
        return {
          namespace: "abunco",
          key: "unit",
          owner_id: parseInt(id),
          value: m.value,
        };
      });
    metafields.push(...variantMetafields);
  });
  console.log("GET metafields", metafields);
  return metafields;
}

// CREATES

export type ShopifyImageInfo = {
  id?: string;
  attachment?: string;
};

export type ShopifyVariantInfo = {
  price?: string;
  inventory_management?: string;
  metafields?: {
    namespace: string;
    key: string;
    type: string;
    value: any;
  }[];
};

export type ShopifyOptionInfo = {
  name: string;
  values: string[];
};

export async function createShopifyProduct(
  authInfo: ShopifyAuthInfo,
  info: {
    title: string;
    body_html: string;
    vendor: string;
    images: ShopifyImageInfo[];
    options?: ShopifyOptionInfo[];
    variants?: ShopifyVariantInfo[];
  }
): Promise<ShopifyProduct> {
  if (!authInfo.writesEnabled) {
    throw new Error("Writes to Shopify are not enabled for this user.");
  }
  let productInfo = {
    title: info.title,
    body_html: info.body_html,
    vendor: info.vendor,
    images: info.images,
    options: info.options,
    variants: info.variants,
  };
  const response = await fetch(`${REST_URI(authInfo)}/products.json`, {
    method: "POST",
    headers: RESTHeaders(authInfo),
    body: JSON.stringify({
      product: productInfo,
    }),
  });
  const { product } = await parseJSONResponse(response);
  console.log("POST product", productInfo, JSON.stringify(product, null, 2));
  return product;
}

// UPDATES

export async function updateShopifyProduct(
  authInfo: ShopifyAuthInfo,
  id: string,
  updates: {
    status?: "active" | "archived";
    title?: string;
    body_html?: string;
    images?: Array<ShopifyImageInfo>;
  }
): Promise<ShopifyProduct> {
  if (!authInfo.writesEnabled) {
    throw new Error("Writes to Shopify are not enabled for this user.");
  }
  let productInfo = {
    id,
    status: updates.status,
    title: updates.title,
    body_html: updates.body_html,
    images: updates.images,
  };
  const response = await fetch(`${REST_URI(authInfo)}/products/${id}.json`, {
    method: "PUT",
    headers: RESTHeaders(authInfo),
    body: JSON.stringify({
      product: productInfo,
    }),
  });
  const { product } = await parseJSONResponse(response);
  console.log("PUT product", productInfo, JSON.stringify(product, null, 2));
  return product;
}

export async function updateShopifyProductVariant(
  authInfo: ShopifyAuthInfo,
  id: string,
  updates: { price?: string; inventory_management?: string }
): Promise<ShopifyVariant> {
  if (!authInfo.writesEnabled) {
    throw new Error("Writes to Shopify are not enabled for this user.");
  }
  let variantInfo = {
    id,
    price: updates.price,
    inventory_management: updates.inventory_management,
  };
  const response = await fetch(`${REST_URI(authInfo)}/variants/${id}.json`, {
    method: "PUT",
    headers: RESTHeaders(authInfo),
    body: JSON.stringify({
      variant: variantInfo,
    }),
  });
  const { variant } = await parseJSONResponse(response);
  console.log("PUT variant", variantInfo, JSON.stringify(variant, null, 2));
  return variant;
}

export async function updateShopifyInventory(
  authInfo: ShopifyAuthInfo,
  inventoryItemID: string,
  updates: { cost?: string; quantity?: number }
): Promise<ShopifyInventoryItem> {
  if (!authInfo.writesEnabled) {
    throw new Error("Writes to Shopify are not enabled for this user.");
  }
  let shopifyInventoryItem: ShopifyInventoryItem | undefined;
  if (updates.cost) {
    let inventoryItemInfo = {
      id: inventoryItemID,
      cost: updates.cost,
    };
    const response = await fetch(
      `${REST_URI(authInfo)}/inventory_items/${inventoryItemID}.json`,
      {
        method: "PUT",
        headers: RESTHeaders(authInfo),
        body: JSON.stringify({
          inventory_item: inventoryItemInfo,
        }),
      }
    );
    const { inventory_item } = await parseJSONResponse(response);
    console.log(
      "PUT inventory_item",
      inventoryItemInfo,
      JSON.stringify(inventory_item, null, 2)
    );
    shopifyInventoryItem = inventory_item;
  }
  if (updates.quantity !== undefined) {
    let inventoryLevelInfo = {
      location_id: authInfo.locationID,
      inventory_item_id: inventoryItemID,
      available: updates.quantity,
    };
    const response = await fetch(
      `${REST_URI(authInfo)}/inventory_levels/set.json`,
      {
        method: "POST",
        headers: RESTHeaders(authInfo),
        body: JSON.stringify(inventoryLevelInfo),
      }
    );
    const { inventory_level } = await parseJSONResponse(response);
    console.log(
      "POST inventory_level",
      inventoryLevelInfo,
      JSON.stringify(inventory_level, null, 2)
    );
  }
  if (!shopifyInventoryItem) {
    shopifyInventoryItem = await getShopifyInventoryItemWithID(
      authInfo,
      `${inventoryItemID}`
    );
  }
  return shopifyInventoryItem;
}

export async function setShopifyProductVariantUnitMetafield(
  authInfo: ShopifyAuthInfo,
  id: string,
  value: string
): Promise<ShopifyMetafield> {
  if (!authInfo.writesEnabled) {
    throw new Error("Writes to Shopify are not enabled for this user.");
  }
  let metafieldInfo = {
    namespace: "abunco",
    key: "unit",
    type: "single_line_text_field",
    value,
  };
  const response = await fetch(
    `${REST_URI(authInfo)}/variants/${id}/metafields.json`,
    {
      method: "POST",
      headers: RESTHeaders(authInfo),
      body: JSON.stringify({
        metafield: metafieldInfo,
      }),
    }
  );
  const { metafield } = await parseJSONResponse(response);
  console.log(
    "PUT variant.metafield",
    metafieldInfo,
    JSON.stringify(metafield, null, 2)
  );
  return metafield;
}

// DELETE

export async function deleteShopifyProduct(
  authInfo: ShopifyAuthInfo,
  productID: string
): Promise<void> {
  if (!authInfo.writesEnabled) {
    throw new Error("Writes to Shopify are not enabled for this user.");
  }
  const response = await fetch(
    `${REST_URI(authInfo)}/products/${productID}.json`,
    {
      method: "DELETE",
      headers: RESTHeaders(authInfo),
    }
  );
  const jsonResponse = await parseJSONResponse(response);
  console.log("DELETE product", JSON.stringify(jsonResponse, null, 2));
}

export async function deleteShopifyProductVariant(
  authInfo: ShopifyAuthInfo,
  productID: string,
  id: string
): Promise<void> {
  if (!authInfo.writesEnabled) {
    throw new Error("Writes to Shopify are not enabled for this user.");
  }
  const response = await fetch(
    `${REST_URI(authInfo)}/products/${productID}/variants/${id}.json`,
    {
      method: "DELETE",
      headers: RESTHeaders(authInfo),
    }
  );
  const jsonResponse = await parseJSONResponse(response);
  console.log("DELETE variant", JSON.stringify(jsonResponse, null, 2));
}
