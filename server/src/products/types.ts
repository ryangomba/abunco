export type InventoryItem = {
  id: string;
  cost: string;
};

export type ProductVariant = {
  id: string;
  createdAt: Date;
  productID: string;
  name: string;
  price: string;
  quantity: number;
  inventoryItemID: string;
};

export enum ProductStatus {
  Active = "active",
  Archived = "archived",
  Draft = "draft",
}

export type Product = {
  id: string;
  createdAt: Date;
  status: ProductStatus;
  storeID: string;
  vendorID: string;
  name: string;
  description: string;
  imageURI: string | null;
  variantIDs: string[];
};

export type ProductVariantUnit = {
  id: string; // `[productVariantID].unit`
  value: string | null;
};

export type ProductVariantBundle = {
  product: Product;
  variant: ProductVariant;
  inventoryItem: InventoryItem;
};

export type ProductBundle = {
  product: Product;
  variants: ProductVariant[];
  inventoryItems: InventoryItem[];
};

export function productVariantBundlesForProductBundle(
  pb: ProductBundle
): ProductVariantBundle[] {
  const productVariantBundles: ProductVariantBundle[] = [];
  pb.variants.forEach((v) => {
    productVariantBundles.push({
      variant: v,
      product: pb.product,
      inventoryItem: pb.inventoryItems.find((i) => i.id == v.inventoryItemID)!,
    });
  });
  return productVariantBundles;
}
