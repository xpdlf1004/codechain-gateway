import * as React from "react";

import { RecipientSelect } from "./Recipient";
import { RegistrarSelect } from "./Registrar";

type AssetTransferAddress = string;
type PlatformAddress = string;
type Recipient =
  | "create"
  | AssetTransferAddress
  | {
      lockScriptHash: string;
      parameters: Buffer[];
    };

export interface MintRequest {
  recipient: Recipient;
  amount: number;
  metadata: string;
  registrar: "none" | PlatformAddress;
}

interface Props {
  onChange?: (err: string | null, request?: MintRequest) => void;
}

interface States {
  data: MintRequest;
}

export class MintComponent extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    this.state = {
      data: {
        recipient: "create",
        amount: 0,
        metadata: "",
        registrar: "none"
      }
    };
  }
  public render() {
    return (
      <div>
        <div>
          Recipient: <RecipientSelect onChange={this.handleRecipientChange} />
        </div>
        <div>
          Metadata: <input onChange={this.handleMetadataChange} />
        </div>
        <div>
          Amount <input onChange={this.handleAmountChange} />
        </div>
        <div>
          {"Registrar "}
          <RegistrarSelect onChange={this.handleRegistrarSelectChange} />
        </div>
      </div>
    );
  }

  private handleRecipientChange = (
    err: string | null,
    recipient: Recipient
  ) => {
    if (err) {
      return this.emitChange(err);
    }
    const data = {
      ...this.state.data,
      recipient
    };
    this.setState({
      data
    });
    this.emitChange(null, data);
  };

  private handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const data = {
      ...this.state.data,
      metadata: e.target.value
    };
    this.setState({
      data
    });
    this.emitChange(null, data);
  };

  private handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const amount = Number.parseInt(e.target.value, 10);
      const data = {
        ...this.state.data,
        amount
      };
      this.setState({ data });
      this.emitChange(null, data);
    } catch (e) {
      this.emitChange(String(e));
    }
  };

  private handleRegistrarSelectChange = (
    err: string | null,
    address: string | "none"
  ) => {
    if (err) {
      return this.emitChange(err);
    }
    const data = {
      ...this.state.data,
      registrar: address
    };
    this.setState({ data });
    this.emitChange(null, data);
  };

  private emitChange = (err: string | null, data?: MintRequest) => {
    if (this.props.onChange) {
      this.props.onChange(err, data);
    }
  };
}
