import * as React from "react";

import { MintTransactionInputGroupValue } from "../../common/types/transactions";

import { FeePayerSelect } from "../components/FeePayerSelect";
import {
  InputGroupError,
  MintTransactionInputGroup
} from "../components/MintTransactionInputGroup";

interface States {
  mintValue: MintTransactionInputGroupValue;
  feePayer: string;
  inputGroupError: InputGroupError;
  txError?: string;
  parcelHash?: string;
}

export class AssetPage extends React.Component<{}, States> {
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
    fetch("//localhost:4000/asset/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        feePayer: this.state.feePayer,
        mintValue: this.state.mintValue
      })
    })
      .then(response => response.json())
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
