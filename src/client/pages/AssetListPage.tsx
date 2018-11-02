import * as React from "react";
import { Link } from "react-router-dom";

interface States {
  assets?: string[];
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
        <span>Total {assets.length} assets</span>
        {assets.map(a => (
          <div key={a}>
            <Link to={`asset/${a}`}>{a}</Link>
          </div>
        ))}
      </div>
    );
  }

  private loadAssets() {
    fetch(`//localhost:4000/asset/list`)
      .then(response => response.json())
      .then(assets => {
        console.log(assets);
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
