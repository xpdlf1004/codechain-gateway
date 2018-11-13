import * as React from "react";
import { Link } from "react-router-dom";

interface Props {
  assetType: string;
  ownerAddress: string;
  // FIXME: U256
  balance: number;
  transferable?: boolean;
}

export class AssetBalance extends React.Component<Props> {
  public render() {
    const {
      assetType,
      ownerAddress,
      balance,
      transferable = false
    } = this.props;
    return (
      <>
        <span>{ownerAddress}</span>
        <span> ... </span>
        <span>{balance}</span>
        {transferable && (
          <Link to={`transfer?assetType=${assetType}&sender=${ownerAddress}`}>
            <button>transfer</button>
          </Link>
        )}
      </>
    );
  }
}
