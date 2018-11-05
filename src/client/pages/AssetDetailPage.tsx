import * as React from "react";
import { match } from "react-router";

import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";

import { ApiClient } from "../api-client";

interface Props {
  match: match<{ assetType: string }>;
}

interface States {
  scheme?: AssetSchemeDoc;
  owners?: {
    [address: string]: number;
  };
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
    this.loadAssetOwners(assetType);
  }

  public render() {
    const { err } = this.state;
    if (err) {
      return <div>Error: {String(err)}</div>;
    }
    return (
      <div>
        {this.renderAssetScheme()}
        {this.renderAssetOwners()}
      </div>
    );
  }

  private renderAssetScheme() {
    const { assetType } = this.props.match.params;
    const { scheme } = this.state;
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
        Total supply: {amount}
      </div>
    );
  }

  private renderAssetOwners() {
    const { owners } = this.state;
    if (!owners) {
      return <div>Loading ... </div>;
    }

    return (
      <div>
        <br />
        <span>Total {Object.keys(owners).length} owners</span>
        {Object.keys(owners).map(address => (
          <div key="address">
            <span>{address}</span>
            <span> ... </span>
            <span>{owners[address]}</span>
            <span>
              <button disabled title="Not supported yet">
                transfer
              </button>
            </span>
          </div>
        ))}
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

  private loadAssetOwners(assetType: string) {
    new ApiClient()
      .getAssetOwners(assetType)
      .then(owners => {
        this.setState({
          owners
        });
      })
      .catch(e => {
        this.setState({
          err: String(e)
        });
      });
  }
}
