import { ApolloServer } from "apollo-server-express";
import { newContextForRequest } from "../auth/context";
import { schema } from "./schema";

export const apolloServer = new ApolloServer({
  schema,
  context: async ({ req }) => {
    const storeSlug = req.headers["abunco-store-slug"] as string | undefined;
    if (!storeSlug) {
      throw new Error("No store ID specified in request");
    }
    return await newContextForRequest(storeSlug);
  },
  formatError: (error) => {
    console.error(error);
    return error;
  },
});
