import * as React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";

import { AccountDetailPage } from "./pages/AccountDetailPage";
import { AccountPage } from "./pages/AccountPage";
import { AssetListPage } from "./pages/AssetListPage";
import { AssetPage } from "./pages/AssetPage";
import { HomePage } from "./pages/HomePage";
import { store } from "./store";

export const App = () => (
  <Provider store={store}>
    <Router>
      <div>
        <Link to="/">Home</Link>
        <br />
        <Link to="/account">Account</Link>
        <br />
        <Link to="/asset">Assets</Link>
        <br />
        <Link to="/asset/new">Mint</Link>
        <hr />
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/account" component={AccountPage} />
          <Route exact path="/account/:address" component={AccountDetailPage} />
          <Route exact path="/asset" component={AssetListPage} />
          <Route exact path="/asset/new" component={AssetPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  </Provider>
);

const NotFound = () => <h1>Page not found</h1>;
