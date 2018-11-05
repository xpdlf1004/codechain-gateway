import * as React from "react";
import { match } from "react-router";

import { ApiClient } from "../api-client";

interface Props {
  match: match<{ assetType: string }>;
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
    const { assetType } = this.props.match.params;
    this.loadAssetDetail(assetType);
  }

  public render() {
    const { assetType } = this.props.match.params;
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
        Asset: {assetType}
        <br />
        metadata: {metadata}
        <br />
        registrar: {registrar}
        <br />
        amount: {amount}
      </div>
    );
  }

  private loadAssetDetail(assetType: string) {
    new ApiClient()
      .getAssetDetail(assetType)
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
