import * as qs from "query-string";
import * as React from "react";

import { TransferOutputInputGroupValue } from "../../common/types/transactions";
import { ApiClient } from "../api-client";
import { FeePayerSelect } from "../components/FeePayerSelect";
import { TransferOutputInputGroup } from "../components/TransferOutputInputGroup";
import { InputGroupError } from "../input-group-error";

interface Props {
  // FIXME: Check react-router has a type definition for the location
  location: { search: string };
}

interface States {
  transferValue: TransferOutputInputGroupValue;
  feePayer: string;
  inputGroupError: InputGroupError;
  txError?: string;
  parcelHash?: string;
}

export class AssetTransferPage extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    const { assetType } = qs.parse(props.location.search) as {
      assetType: string;
    };

    this.state = {
      transferValue: {
        recipient: "create",
        amount: 1,
        assetType
      },
      feePayer: "tccqym6zrsevq83ak29vw7j6k2q2sh9ep2evuvaeh47",
      inputGroupError: {}
    };
  }

  public render() {
    const { assetType, sender } = qs.parse(this.props.location.search) as {
      assetType: string;
      sender: string;
    };
    const { parcelHash, txError, inputGroupError } = this.state;
    if (Array.isArray(assetType)) {
      throw Error("Unexpected assetType");
    }
    if (txError) {
      return <div>Transaction error: {txError}</div>;
    }
    return (
      <div>
        Asset Transfer <br />
        sender: {sender}
        <br />
        <TransferOutputInputGroup
          assetType={assetType}
          onChange={this.handleTransferOutputInputGroupChange}
        />
        <hr />
        <FeePayerSelect
          addresses={
            [
              "tccqym6zrsevq83ak29vw7j6k2q2sh9ep2evuvaeh47"
            ] /* Not implemented */
          }
          onChange={this.handleFeePayerSelectChange}
        />
        <br />
        <span title={Object.keys(inputGroupError).join(" ")}>
          <button
            onClick={this.handleSendClick}
            disabled={Object.keys(inputGroupError).length > 0}
          >
            Send Transaction
          </button>
        </span>
        {parcelHash && (
          <a
            href={`https://husky.codechain.io/explorer/parcel/${parcelHash}`}
            target="_blank"
          >
            Transaction sent
          </a>
        )}
      </div>
    );
  }

  private handleTransferOutputInputGroupChange = (
    err: InputGroupError,
    value: TransferOutputInputGroupValue
  ) => {
    if (Object.keys(err).length > 0) {
      return this.setState({
        inputGroupError: err
      });
    }
    this.setState({
      inputGroupError: err,
      transferValue: value
    });
  };

  private handleFeePayerSelectChange = () => {
    // Not implemented
  };

  private handleSendClick = () => {
    const { transferValue, feePayer } = this.state;
    const { sender } = qs.parse(this.props.location.search) as {
      sender: string;
    };
    new ApiClient()
      .transferAsset(transferValue, sender, feePayer)
      .then(result => {
        this.setState({
          parcelHash: `0x${result}`
        });
      })
      .catch(err => {
        this.setState({ txError: String(err) });
      });
  };
}
