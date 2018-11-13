import * as React from "react";
import { match } from "react-router";

import { AssetDetail } from "../../common/types/asset";
import { ApiClient } from "../api-client";
import { AssetBalance } from "../components/AssetBalance";
import { AssetRuleEditor } from "../components/AssetRuleEditor";

interface Props {
  match: match<{ assetType: string }>;
}

interface States {
  item?: AssetDetail;
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
  }

  public render() {
    const { err } = this.state;
    if (err) {
      return <div>Error: {String(err)}</div>;
    }
    return <div>{this.renderAssetDetail()}</div>;
  }

  private renderAssetDetail() {
    const { item } = this.state;
    if (!item) {
      return <div>Loading ... </div>;
    }
    const { type, name, mintTxHash } = item;
    return (
      <div>
        <h3>Asset Name: {name}</h3>
        AssetType: {type}
        <br />
        <AssetRuleEditor assetType={type} />
        <br />
        {item.scheme ? (
          <>
            <br />
            metadata:
            <input type="text" value={item.scheme.metadata} disabled />
            <br />
            registrar:
            <input type="text" value={item.scheme.registrar || ""} disabled />
            <br />
            Total supply: {item.scheme.amount}
            <br />
            {this.renderAssetOwners()}
          </>
        ) : (
          <>
            MintTransaction is not confirmed yet:{" "}
            <a
              href={`https://husky.codechain.io/explorer/tx/${mintTxHash}`}
              target="_blank"
            >
              Go to explorer
            </a>
          </>
        )}
      </div>
    );
  }

  private renderAssetOwners() {
    const { assetType } = this.props.match.params;
    const { owners } = this.state;
    if (!owners) {
      return <div>Loading ... </div>;
    }

    return (
      <div>
        <br />
        <span>Total {Object.keys(owners).length} owners</span>
        {Object.keys(owners).map(address => (
          <div key={address}>
            <AssetBalance
              assetType={assetType}
              ownerAddress={address}
              balance={owners[address]}
              transferable={/* FIXME */ true}
            />
          </div>
        ))}
      </div>
    );
  }

  private loadAssetDetail(assetType: string) {
    new ApiClient()
      .getAssetDetail(assetType)
      .then(detail => {
        this.setState({
          item: detail,
          err: undefined
        });
        this.loadAssetOwners(assetType);
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
