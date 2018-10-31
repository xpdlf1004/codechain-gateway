import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

interface DispatchProps {
  dispatch: Dispatch;
}

type Props = DispatchProps;

class AccountInternal extends React.Component<Props> {
  public render() {
    return <h1>Account Page</h1>;
  }
}

export const Account = connect(() => ({}))(AccountInternal);
