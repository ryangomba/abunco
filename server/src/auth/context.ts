import { v4 as uuidv4 } from "uuid";
import { ShopifyAuthInfo } from "../shopify";

interface Record {
  id: string;
}

class RecordCache {
  _records: { [key: string]: Record } = {};
  cache(record: Record) {
    this._records[record.id] = record;
  }
  cacheMany(records: Record[]) {
    records.forEach(this.cache.bind(this));
  }
  get(id: string): Record | undefined {
    return this._records[id];
  }
}

export type UserConfig = {
  slug: string;
  companyName: string;
  shopifyStoreSlug: string;
  shopifyAPIKey: string;
  shopifyAPISecret: string;
  shopifyLocationID: string;
  shopifyWritesEnabled: boolean;
};

export type Context = {
  requestID: string;
  companyName: string;
  shopifyInfo: ShopifyAuthInfo;
  recordCache: RecordCache;
};

const USER_CONFIGS: [UserConfig] = JSON.parse(
  process.env.USER_CONFIGS as string
).users;

export function getUserConfigForStore(storeSlug: string): UserConfig {
  const userConfig = USER_CONFIGS.find((c) => c.slug === storeSlug);
  if (!userConfig) {
    throw new Error(`User config not found for store: ${storeSlug}`);
  }
  return userConfig;
}

export async function newContextForRequest(
  storeSlug: string
): Promise<Context> {
  const userConfig = getUserConfigForStore(storeSlug);
  return {
    requestID: uuidv4(),
    companyName: userConfig.companyName,
    shopifyInfo: {
      storeSlug: userConfig.shopifyStoreSlug,
      apiKey: userConfig.shopifyAPIKey,
      apiSecretKey: userConfig.shopifyAPISecret,
      locationID: userConfig.shopifyLocationID,
      writesEnabled: userConfig.shopifyWritesEnabled,
    },
    recordCache: new RecordCache(),
  };
}
