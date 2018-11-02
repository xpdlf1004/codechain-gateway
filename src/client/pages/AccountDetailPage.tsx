import * as React from "react";
import { match } from "react-router";

import { PlatformAddress } from "codechain-primitives/lib";

interface Props {
  match: match<{ address: string }>;
}

interface States {
  isAddressValid: boolean;
  details?: {
    balance: string;
    seq: string;
  };
  err?: string;
}

export class AccountDetailPage extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    const { address } = props.match.params;

    this.state = {
      isAddressValid: PlatformAddress.check(address)
    };
  }

  public componentWillMount() {
    if (this.state.isAddressValid) {
      this.loadAccountDetail(this.props.match.params.address);
    }
  }

  public render() {
    const { details, err, isAddressValid } = this.state;
    if (!isAddressValid) {
      return <div>Invalid Address!</div>;
    }
    if (err) {
      return <div>Error: {err}</div>;
    }
    if (!details) {
      return <div>loading</div>;
    }
    const { address } = this.props.match.params;
    const { balance, seq } = details;
    return (
      <div>
        <h4>address: {address}</h4>
        <br />
        balance: {balance}
        <br />
        seq: {seq}
      </div>
    );
  }

  private loadAccountDetail(address: string) {
    fetch(`//localhost:4000/account/${address}`)
      .then(response => response.json())
      .then(({ balance, seq }) => {
        this.setState({
          details: {
            balance,
            seq
          }
        });
      })
      .catch(e => {
        this.setState({
          err: String(e)
        });
      });
  }
}
