export function currentStoreID(): string {
  return window.location.pathname.split("/")[1];
}

export function storeURL(storeID?: string): string {
  return `/${storeID || currentStoreID()}`;
}

export function vendorURL(vendorID: string): string {
  return storeURL() + "/vendors/" + encodeURIComponent(vendorID);
}

export function productVariantURL(productVariantID: string): string {
  return storeURL() + "/productVariants/" + productVariantID;
}
