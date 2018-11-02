import * as React from "react";
import { match } from "react-router";

import { ApiClient } from "../api-client";

interface Props {
  match: match<{ address: string }>;
}

interface States {
  scheme?: any;
  err?: string;
}

export class AssetDetailPage extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    const { address } = this.props.match.params;
    this.loadAssetDetail(address);
  }

  public render() {
    const { address } = this.props.match.params;
    const { scheme, err } = this.state;
    if (err) {
      return <div>Error: {String(err)}</div>;
    }
    if (!scheme) {
      return <div>Loading ... </div>;
    }
    const { metadata, registrar, amount } = scheme;
    return (
      <div>
        Asset: {address}
        <br />
        metadata: {metadata}
        <br />
        registrar: {registrar}
        <br />
        amount: {amount}
      </div>
    );
  }

  private loadAssetDetail(address: string) {
    new ApiClient()
      .getAssetDetail(address)
      .then(assetScheme => {
        this.setState({
          scheme: assetScheme,
          err: undefined
        });
      })
      .catch(e => {
        this.setState({
          err: String(e)
        });
      });
  }
}
