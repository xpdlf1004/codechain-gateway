import update from "immutability-helper";
import * as React from "react";

import {
  MintTransactionInputValue,
  RecipientSelectValue,
  RegistrarSelectValue
} from "../../common/types/transactions";

import { InputGroupError } from "../input-group-error";
import { MetadataInput, MetadataInputValue } from "./MetadataInput";
import { RecipientSelect } from "./RecipientSelect";
import { RegistrarSelect } from "./RegistrarSelect";

interface Props {
  onChange?: (
    err: InputGroupError | null,
    request?: MintTransactionInputValue
  ) => void;
}

interface States {
  errors: InputGroupError;
  data: MintTransactionInputValue;
}

export class MintTransactionInput extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    this.state = {
      errors: {
        amount: "amount must be a positive integer"
      },
      data: {
        recipient: "create",
        amount: 0,
        metadata: "",
        registrar: "none"
      }
    };
  }

  public componentDidMount() {
    if (Object.keys(this.state.errors)) {
      this.emitChange(this.state.errors);
    }
  }

  public render() {
    return (
      <div>
        <fieldset>
          <legend>Asset Scheme</legend>
          <div>
            Metadata: <MetadataInput onChange={this.handleMetadataChange} />
          </div>
          <div>
            Registrar:
            <RegistrarSelect
              onChange={this.handleRegistrarSelectChange}
              value={this.state.data.registrar}
            />
          </div>
          <div>
            Amount <input onChange={this.handleAmountChange} defaultValue="0" />
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

  private handleMetadataChange = (value: MetadataInputValue) => {
    let newData;
    switch (value.type) {
      case "basic":
        newData = update(this.state.data, {
          metadata: {
            $set: JSON.stringify(value.value)
          }
        });
        break;
      case "manual":
        newData = update(this.state.data, {
          metadata: {
            $set: value.value
          }
        });
        break;
      default:
        throw Error(`Unexpected error`);
    }
    this.setState({
      data: newData
    });
    this.emitChange(this.state.errors, newData);
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

  private handleRegistrarSelectChange = (value: RegistrarSelectValue) => {
    const newState = update(this.state, {
      errors: {
        $unset: ["registrar"]
      },
      data: {
        registrar: {
          $set: value
        }
      }
    });
    this.setState(newState);
    this.emitChange(newState.errors, newState.data);
  };

  private emitChange = (
    err: InputGroupError | null,
    data?: MintTransactionInputValue
  ) => {
    if (this.props.onChange) {
      this.props.onChange(err, data);
    }
  };
}