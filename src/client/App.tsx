import * as React from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";

import { Account } from "./pages/Account";
import { Home } from "./pages/Home";

export const App = () => (
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
);

const NotFound = () => <h1>Page not found</h1>;
