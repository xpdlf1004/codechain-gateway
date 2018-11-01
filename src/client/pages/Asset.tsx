import * as React from "react";

import { MintTransactionInputGroupValue } from "../../common/types/transactions";

import { FeePayerSelect } from "../components/FeePayerSelect";
import { MintComponent } from "../components/Mint";

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
    data: MintTransactionInputGroupValue
  ) => {
    // Not implemented
  };

  private handleSendClick = () => {
    // Not implemented
  };
}
