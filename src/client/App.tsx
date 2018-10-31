import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { Home } from "./pages/Home";

export const App = () => (
  <Router>
    <div>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </div>
  </Router>
);

const NotFound = () => <h1>Page not found</h1>;
