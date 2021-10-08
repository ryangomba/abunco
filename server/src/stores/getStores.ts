import { Context, getUserConfigForStore } from "../auth/context";
import { Store } from "./types";

export async function getStoreWithID(
  ctx: Context,
  storeID: string
): Promise<Store> {
  return {
    id: storeID,
    name: getUserConfigForStore(storeID).companyName,
  };
}
