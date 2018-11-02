import * as React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";

import { Account } from "./pages/Account";
import { AccountDetail } from "./pages/AccountDetail";
import { Asset as AssetPage } from "./pages/Asset";
import { AssetListPage } from "./pages/AssetListPage";
import { Home } from "./pages/Home";
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
          <Route exact path="/" component={Home} />
          <Route exact path="/account" component={Account} />
          <Route exact path="/account/:address" component={AccountDetail} />
          <Route exact path="/asset" component={AssetListPage} />
          <Route exact path="/asset/new" component={AssetPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  </Provider>
);

const NotFound = () => <h1>Page not found</h1>;
