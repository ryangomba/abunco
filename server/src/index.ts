import cors from "cors";
import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import "./env"; // Needs to be at top
import { apolloServer } from "./graphql";

async function startApolloServer() {
  const app = express();
  app.use(cors());
  app.use(morgan("tiny"));

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    path: "/graphql",
    bodyParserConfig: {
      limit: "10mb",
    },
  });

  const port = process.env.PORT;
  const httpServer = createServer(app);
  httpServer.listen({ port }, () => {
    console.log(`🚀 Server is now running on port ${port}`);
  });
}

startApolloServer();
