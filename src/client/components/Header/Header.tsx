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
              <h5 className="ml-1 title mb-0 mr-2">CodeChain Gateway</h5>
            </div>
          </Link>
          <div className="d-flex align-items-center menu-container">
            <div className="ml-auto menu-item mr-4">
              <Link to="/" className="link-reverse">
                <span>Menu 1</span>
              </Link>
            </div>
            <div className="menu-item">
              <Link to="/" className="link-reverse">
                <span>Menu 2</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Header);
