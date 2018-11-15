import * as React from "react";
import { match } from "react-router";

import { AssetDetail } from "../../../common/types/asset";
import { ApiClient } from "../../api-client";
import { AssetBalance } from "../../components/AssetBalance/AssetBalance";
import { AssetRuleEditor } from "../../components/AssetRuleEditor/AssetRuleEditor";
import { TransactionLink } from "../../components/TransactionLink";

import { Type } from "codechain-indexer-types/lib/utils";

import { Label } from "reactstrap";
import "./AssetDetailPage.css";

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
    const { type, name, mintTxHash, scheme } = item;
    const metadata = scheme && Type.getMetadata(scheme.metadata);
    return (
      <div className="asset-detail-page">
        <div className="d-flex align-items-center">
          {metadata &&
            metadata.icon_url && (
              <div className="mr-3">
                <img className="icon" src={metadata.icon_url} />
              </div>
            )}
          <div>
            <h3>{name}</h3>
            <span className="mono">{type}</span>
          </div>
        </div>
        <hr />
        <AssetRuleEditor assetType={type} />
        <hr />
        {item.scheme ? (
          <div>
            <div className="form-group">
              <Label>Metadata</Label>
              <textarea
                className="form-control"
                value={item.scheme.metadata}
                rows={5}
                disabled
              />
            </div>
            <div className="form-group">
              <Label>Registrar</Label>
              <input
                className="form-control"
                type="text"
                value={item.scheme.registrar || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <Label>Total supply</Label>
              <input
                className="form-control"
                type="text"
                value={item.scheme.amount || ""}
                disabled
              />
            </div>
            <hr />
            {this.renderAssetOwners()}
          </div>
        ) : (
          <div>
            MintTransaction is not confirmed yet:{" "}
            <TransactionLink txhash={mintTxHash}>
              Go to explorer
            </TransactionLink>
          </div>
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
