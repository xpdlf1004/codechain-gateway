import * as React from "react";
import { Link, withRouter } from "react-router-dom";

import * as logo from "./img/logo.png";

import "./Header.css";

class Header extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
  }
  public render() {
    return (
      <div className="header">
        <div className="d-flex h-100">
          <Link to="/">
            <div className="d-flex align-items-center title-container justify-content-center">
              <img src={logo} className="logo" />
              <h4 className="ml-1 title mb-0 mr-1">CodeChain Gateway</h4>
            </div>
          </Link>
          <div className="d-flex align-items-center menu-container">
            <div className="ml-auto menu-item mr-4">Menu 1</div>
            <div className="menu-item">Menu 2</div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Header);
