import * as React from "react";
import { Link, withRouter } from "react-router-dom";

import "./SideMenu.css";

class SideMenu extends React.Component<any, any> {
  public render() {
    return (
      <div className="side-menu">
        <ul className="list-unstyled">
          <li>
            <Link to="/">
              <div className="menu-item d-flex align-items-center">Home</div>
            </Link>
          </li>
          <li>
            <Link to="/account">
              <div className="menu-item d-flex align-items-center">Account</div>
            </Link>
          </li>
          <li>
            <Link to="/asset">
              <div className="menu-item d-flex align-items-center">Asset</div>
            </Link>
          </li>
          <li>
            <Link to="/asset/address">
              <div className="menu-item d-flex align-items-center">
                Asset Address
              </div>
            </Link>
          </li>
          <li>
            <Link to="/transaction">
              <div className="menu-item d-flex align-items-center">
                Transaction List
              </div>
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default withRouter(SideMenu);
