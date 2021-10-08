# Abunco

Delegate Shopify inventory to suppliers.

Sometimes people run a Shopify store that aggregates products from many vendors, e.g. a food hub offers food from a number of local farms. Wouldn't it be nice to delegate product listings and available inventory to these suppliers? This project is a proof of concept. It creates a responsive web page for each vendor where they can add, update, and remove their own products for sale.

### Development

To configure the server, you'll need to add a `.env` file in `/server/src`, specifying the `PORT` you'd like to run on, as well as a `USER_CONFIGS` JSON structure that describes the various Shopify stores you'd like to support. An example with sensitive information redacted):

```
PORT=3100
USER_CONFIGS={"users":[{"slug":"atlantis","companyName":"Atlantis Food Hub","shopifyStoreSlug":"ryan-gomba","shopifyAPIKey":"[REDACTED]","shopifyAPISecret":"[REDACTED]","shopifyLocationID":"65029636249","shopifyWritesEnabled":true}]}
```

To run the client and server, you'll need to have `node` and `yarn` installed. One way to do this to to first install [Homebrew](https://brew.sh), then:

```
brew install node
brew install yarn
```

To run the server:

```
cd server
yarn # only if dependencies have changed
yarn dev
```

To run the client:

```
cd client
yarn # only if dependencies have changed
yarn dev
```

Visit `http://localhost:3101/{user-slug}` in your browser, e.g. `http://localhost:3101/atlantis`.

### Deployment

Both server and client are deployed using [Render](https://dashboard.render.com). Pushing to the `master` branch will kick off a new deploy.

