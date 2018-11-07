import update from "immutability-helper";
import * as React from "react";

import {
  MintTransactionInputGroupValue,
  RecipientSelectValue,
  RegistrarSelectValue
} from "../../common/types/transactions";

import { InputGroupError } from "../input-group-error";
import { RecipientSelect } from "./RecipientSelect";
import { RegistrarSelect } from "./RegistrarSelect";

interface Props {
  onChange?: (
    err: InputGroupError | null,
    request?: MintTransactionInputGroupValue
  ) => void;
}

interface States {
  errors: InputGroupError;
  data: MintTransactionInputGroupValue;
}

export class MintTransactionInputGroup extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    this.state = {
      errors: {},
      data: {
        recipient: "create",
        amount: 1,
        metadata: "",
        registrar: "none"
      }
    };
  }

  public render() {
    return (
      <div>
        <fieldset>
          <legend>Asset Scheme</legend>
          <div>
            Metadata: <input onChange={this.handleMetadataChange} />
          </div>
          <div>
            Registrar:
            <RegistrarSelect onChange={this.handleRegistrarSelectChange} />
          </div>
          <div>
            Amount <input onChange={this.handleAmountChange} />
          </div>
        </fieldset>
        <div>
          Recipient: <RecipientSelect onChange={this.handleRecipientChange} />
        </div>
      </div>
    );
  }

  private handleRecipientChange = (
    err: string | null,
    recipient: RecipientSelectValue
  ) => {
    if (err) {
      const errors = update(this.state.errors, {
        recipient: { $set: err }
      });
      this.setState({
        errors
      });
      return this.emitChange(errors);
    }
    const newState = update(this.state, {
      errors: { $unset: ["recipient"] },
      data: {
        recipient: {
          $set: recipient
        }
      }
    });
    this.setState(newState);
    this.emitChange(newState.errors, newState.data);
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
    const amount = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
      const errors = update(this.state.errors, {
        amount: {
          $set: `The amount must be a positive integer but found ${
            e.target.value
          }`
        }
      });
      this.setState({ errors });
      this.emitChange(errors);
      return;
    }
    const newState = update(this.state, {
      data: {
        amount: {
          $set: amount
        }
      },
      errors: {
        $unset: ["amount"]
      }
    });
    this.setState(newState);
    this.emitChange(newState.errors, newState.data);
  };

  private handleRegistrarSelectChange = (
    err: string | null,
    address: RegistrarSelectValue
  ) => {
    if (err) {
      const errors = update(this.state.errors, {
        registrar: {
          $set: String(err)
        }
      });
      this.setState({ errors });
      return this.emitChange(errors);
    }
    const newState = update(this.state, {
      errors: {
        $unset: ["registrar"]
      },
      data: {
        registrar: {
          $set: address
        }
      }
    });
    this.setState(newState);
    this.emitChange(newState.errors, newState.data);
  };

  private emitChange = (
    err: InputGroupError | null,
    data?: MintTransactionInputGroupValue
  ) => {
    if (this.props.onChange) {
      this.props.onChange(err, data);
    }
  };
}
