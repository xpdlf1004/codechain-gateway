import * as React from "react";
import { ApiClient } from "../api-client";

interface States {
  addresses?: string[];
  err?: string;
}

export class AssetAddressPage extends React.Component<{}, States> {
  constructor(props: {}) {
    super(props);

    this.state = {};
  }

  public componentDidMount() {
    this.loadAssetAddressList();
  }

  public render() {
    const { addresses, err } = this.state;
    if (err !== undefined) {
      return <div>AssetAddress page errored: {err}</div>;
    }
    if (addresses === undefined) {
      return <div>Loading</div>;
    }
    return (
      <div>
        {addresses.map(a => (
          <div key={a}>
            <span>{a}</span>
            <button onClick={() => this.onClickRemove(a)}>x</button>
          </div>
        ))}
      </div>
    );
  }

  private onClickRemove = (address: string) => {
    new ApiClient()
      .removeAssetAddress(address)
      .then(() => {
        const { addresses } = this.state;
        if (addresses !== undefined) {
          this.setState({ addresses: addresses.filter(a => a !== address) });
        }
      })
      .catch(e => {
        this.setState({ err: String(e) });
      });
  };

  private loadAssetAddressList() {
    new ApiClient()
      .getAssetAddressList()
      .then(({ addresses }) => {
        this.setState({
          addresses,
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
