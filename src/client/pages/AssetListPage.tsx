import * as React from "react";
import { Link } from "react-router-dom";

import { Asset } from "../../common/types/asset";
import { ApiClient } from "../api-client";

interface States {
  assets?: Asset[];
  err?: string;
}

export class AssetListPage extends React.Component<{}, States> {
  constructor(props: {}) {
    super(props);

    this.state = {};
  }

  public componentDidMount() {
    this.loadAssets();
  }

  public render() {
    const { assets, err } = this.state;
    if (err) {
      return <div>Error: {err}</div>;
    }
    if (!assets) {
      return <div>Loading ...</div>;
    }
    return (
      <div>
        <h3>Asset</h3>
        <br />
        <div>
          <Link to={`/asset/new`}>
            <button type="button" className="btn btn-primary">
              Mint a new asset
            </button>
          </Link>
        </div>
        <br />

        <span>Total {assets.length} assets</span>
        {assets.map(a => (
          <div key={a.type}>
            <Link to={`asset/${a.type}`}>{a.name}</Link>
          </div>
        ))}
      </div>
    );
  }

  private loadAssets() {
    new ApiClient()
      .getAssetList()
      .then(assets => {
        this.setState({
          assets
        });
      })
      .catch(e => {
        this.setState({
          err: String(e)
        });
      });
  }
}
