import * as React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";

import { Account } from "./pages/Account";
import { Home } from "./pages/Home";
import { store } from "./store";

export const App = () => (
  <Provider store={store}>
    <Router>
      <div>
        <Link to="/">Home</Link>
        <br />
        <Link to="/account">Account</Link>
        <hr />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/account" component={Account} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  </Provider>
);

const NotFound = () => <h1>Page not found</h1>;
