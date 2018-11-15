import * as React from "react";

import { MintTransactionInputValue } from "../../common/types/transactions";

import { ApiClient } from "../api-client";
import { FeePayerSelect } from "../components/FeePayerSelect";
import { MintTransactionInput } from "../components/MintTransactionInput";
import { ParcelLink } from "../components/ParcelLink";
import { InputGroupError } from "../input-group-error";

interface States {
  mintValue: MintTransactionInputValue;
  feePayer: string;
  inputGroupError: InputGroupError;
  txError?: string;
  parcelHash?: string;
}

export class AssetMintPage extends React.Component<{}, States> {
  constructor(props: {}) {
    super(props);

    this.state = {
      mintValue: {
        recipient: { type: "create" },
        amount: 0,
        metadata: "",
        registrar: "none"
      },
      feePayer: "tccqym6zrsevq83ak29vw7j6k2q2sh9ep2evuvaeh47",
      inputGroupError: {}
    };
  }

  public render() {
    const { txError, inputGroupError, parcelHash } = this.state;
    if (txError) {
      return <div>Errored: {txError}</div>;
    }
    return (
      <div>
        <MintTransactionInput
          onChange={this.handleMintTransactionEditorChange}
        />
        <hr />
        FeePayer:
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
            disabled={this.shouldDisableSubmit}
          >
            Send Transaction
          </button>
        </span>
        {parcelHash && (
          <ParcelLink parcelHash={parcelHash}>Transaction sent</ParcelLink>
        )}
      </div>
    );
  }

  private get shouldDisableSubmit(): boolean {
    return Object.keys(this.state.inputGroupError).length > 0;
  }

  private handleFeePayerSelectChange = (
    err: string | null,
    address: string
  ) => {
    // Not implemented
  };

  private handleMintTransactionEditorChange = (
    err: InputGroupError | null,
    data: MintTransactionInputValue
  ) => {
    if (err !== null && Object.keys(err).length > 0) {
      this.setState({
        inputGroupError: err
      });
      return;
    }
    this.setState({
      mintValue: data,
      inputGroupError: err || {}
    });
  };

  private handleSendClick = () => {
    const { mintValue, feePayer } = this.state;
    new ApiClient()
      .mintAsset(mintValue, feePayer)
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
