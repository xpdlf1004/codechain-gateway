import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
              <div className="menu-item d-flex align-items-center">
                <FontAwesomeIcon icon="home" className="mr-3 icon" />
                <span>Home</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/account">
              <div className="menu-item d-flex align-items-center">
                <FontAwesomeIcon icon="user" className="mr-3 icon" />
                <span>Account</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/asset">
              <div className="menu-item d-flex align-items-center">
                <FontAwesomeIcon icon="gift" className="mr-3 icon" />
                <span>Asset</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/asset/address">
              <div className="menu-item d-flex align-items-center">
                <FontAwesomeIcon icon="address-book" className="mr-3 icon" />
                <span>Asset Address</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/transaction">
              <div className="menu-item d-flex align-items-center">
                <FontAwesomeIcon icon="list" className="mr-3 icon" />
                <span>Transaction List</span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default withRouter(SideMenu);
