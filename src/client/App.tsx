import * as React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";

import { AccountDetailPage } from "./pages/AccountDetailPage";
import { AccountPage } from "./pages/AccountPage";
import { AssetAddressPage } from "./pages/AssetAddressPage";
import { AssetDetailPage } from "./pages/AssetDetailPage";
import { AssetListPage } from "./pages/AssetListPage";
import { AssetMintPage } from "./pages/AssetMintPage";
import { AssetTransferPage } from "./pages/AssetTransferPage";
import { HomePage } from "./pages/HomePage";
import { TransactionPage } from "./pages/TransactionPage";
import { store } from "./store";

export const App = () => (
  <Provider store={store}>
    <Router>
      <div>
        <Link to="/">Home</Link>
        <br />
        <Link to="/account">Account</Link>
        <br />
        <Link to="/asset">Asset</Link>
        <br />
        <Link to="/asset/address">Asset Address</Link>
        <br />
        <Link to="/transaction">Transaction List</Link>
        <hr />
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/account" component={AccountPage} />
          <Route exact path="/account/:address" component={AccountDetailPage} />
          <Route exact path="/asset" component={AssetListPage} />
          <Route exact path="/asset/address" component={AssetAddressPage} />
          <Route exact path="/asset/new" component={AssetMintPage} />
          <Route exact path="/asset/transfer" component={AssetTransferPage} />
          <Route exact path="/asset/:assetType" component={AssetDetailPage} />
          <Route exact path="/transaction" component={TransactionPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  </Provider>
);

const NotFound = () => <h1>Page not found</h1>;
