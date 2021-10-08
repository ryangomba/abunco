import { Context } from "../auth/context";
import { getShopifyProductVendors } from "../shopify";
import { Vendor } from "./types";

export async function getVendorWithID(
  ctx: Context,
  vendorID: string
): Promise<Vendor> {
  const shopifyVendors = await getShopifyProductVendors(ctx.shopifyInfo);
  const vendor = shopifyVendors.find((v) => v == vendorID);
  if (!vendor) {
    throw new Error(`Vendor not found for id ${vendorID}`);
  }
  return vendorFromShopifyVendor(vendor);
}

export async function getVendorsForStore(
  ctx: Context,
  storeID: string
): Promise<Vendor[]> {
  const shopifyVendors = await getShopifyProductVendors(ctx.shopifyInfo);
  return shopifyVendors.map(vendorFromShopifyVendor);
}

function vendorFromShopifyVendor(v: string): Vendor {
  return {
    id: v,
    createdAt: new Date(),
    storeID: "123",
    name: v,
  };
}
