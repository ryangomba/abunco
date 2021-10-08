import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NewProductPage from "./pages/NewProductPage";
import ProductVariantPage from "./pages/ProductVariantPage";
import StorePage from "./pages/StorePage";
import VendorPage from "./pages/VendorPage";

function App() {
  return (
    <Router>
      <div className="App">
        <div className="container m-auto pb-20">
          <Switch>
            <Route exact path="/:storeID">
              <StorePage />
            </Route>
            <Route path="/:storeID/vendors/:vendorID/new-product">
              <NewProductPage />
            </Route>
            <Route path="/:storeID/vendors/:vendorID">
              <VendorPage />
            </Route>
            <Route path="/:storeID/productVariants/:productVariantID">
              <ProductVariantPage />
            </Route>
            <Route path="*">
              <NoMatch />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

function NoMatch() {
  return (
    <div>
      <h3>404</h3>
    </div>
  );
}

export default App;
