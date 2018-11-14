import * as React from "react";
import { IndexLinkContainer } from "react-router-bootstrap";
import { withRouter } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";

import * as logo from "./img/logo.png";

import "./Header.css";

class Header extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
  }
  public render() {
    return (
      <div className="header">
        <Navbar color="dark" dark expand="md">
          <IndexLinkContainer to="/">
            <NavbarBrand>
              <div className="d-flex align-items-center">
                <img src={logo} className="logo" />
                <span className="ml-1">CodeChain Gateway</span>
              </div>
            </NavbarBrand>
          </IndexLinkContainer>
        </Navbar>
      </div>
    );
  }
}

export default withRouter(Header);
