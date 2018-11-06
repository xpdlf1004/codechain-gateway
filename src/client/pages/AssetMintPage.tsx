import * as React from "react";

import { MintTransactionInputGroupValue } from "../../common/types/transactions";

import { ApiClient } from "../api-client";
import { FeePayerSelect } from "../components/FeePayerSelect";
import { MintTransactionInputGroup } from "../components/MintTransactionInputGroup";
import { InputGroupError } from "../input-group-error";

interface States {
  mintValue: MintTransactionInputGroupValue;
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
        recipient: "create",
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
        <MintTransactionInputGroup
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

  private handleFeePayerSelectChange = (
    err: string | null,
    address: string
  ) => {
    // Not implemented
  };

  private handleMintTransactionEditorChange = (
    err: InputGroupError | null,
    data: MintTransactionInputGroupValue
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
