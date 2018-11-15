import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faAddressBook,
  faGift,
  faHome,
  faList,
  faTrash,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Header from "./components/Header/Header";
import SideMenu from "./components/SideMenu/SideMenu";
import { AccountDetailPage } from "./pages/AccountDetailPage";
import { AccountPage } from "./pages/AccountPage/AccountPage";
import { AssetAddressPage } from "./pages/AssetAddressPage/AssetAddressPage";
import { AssetDetailPage } from "./pages/AssetDetailPage";
import { AssetListPage } from "./pages/AssetListPage";
import { AssetMintPage } from "./pages/AssetMintPage";
import { AssetTransferPage } from "./pages/AssetTransferPage";
import { HomePage } from "./pages/HomePage";
import { TransactionPage } from "./pages/TransactionPage";
import { store } from "./store";

library.add(faHome, faUser, faGift, faAddressBook, faList, faTrash);

export const App = () => (
  <Provider store={store}>
    <Router>
      <div>
        <Header />
        <div className="d-flex">
          <SideMenu />
          <div className="flex-grow-1 flex-shrink-1 content-container">
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/account" component={AccountPage} />
              <Route
                exact
                path="/account/:address"
                component={AccountDetailPage}
              />
              <Route exact path="/asset" component={AssetListPage} />
              <Route exact path="/asset/address" component={AssetAddressPage} />
              <Route exact path="/asset/new" component={AssetMintPage} />
              <Route
                exact
                path="/asset/transfer"
                component={AssetTransferPage}
              />
              <Route
                exact
                path="/asset/:assetType"
                component={AssetDetailPage}
              />
              <Route exact path="/transaction" component={TransactionPage} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  </Provider>
);

const NotFound = () => <h3>Page not found</h3>;
