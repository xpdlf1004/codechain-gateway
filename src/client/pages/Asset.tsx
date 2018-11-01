import * as React from "react";

import { FeePayerSelect } from "../components/FeePayerSelect";
import { MintComponent, MintRequest } from "../components/Mint";

export class Asset extends React.Component {
  public render() {
    return (
      <div>
        <MintComponent onChange={this.handleMintTransactionEditorChange} />
        <hr />
        FeePayer:
        <FeePayerSelect
          addresses={[] /* Not implemented */}
          onChange={this.handleFeePayerSelectChange}
        />
        <br />
        <button onClick={this.handleSendClick}>Send Transaction</button>
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
    err: string | null,
    data: MintRequest
  ) => {
    // Not implemented
  };

  private handleSendClick = () => {
    // Not implemented
  };
}
