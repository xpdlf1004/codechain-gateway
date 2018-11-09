import * as React from "react";

import update from "immutability-helper";
import {
  RecipientSelectValue,
  TransferOutputInputGroupValue
} from "../../common/types/transactions";
import { InputGroupError } from "../input-group-error";
import { RecipientSelect } from "./RecipientSelect";

interface Props {
  assetType?: string;
  onChange?: (
    err: InputGroupError,
    value?: TransferOutputInputGroupValue | null
  ) => void;
}

interface States {
  errors: InputGroupError;
  value: TransferOutputInputGroupValue;
}

export class TransferOutputInput extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      errors: {},
      value: {
        recipient: { type: "create" },
        amount: 1,
        assetType: props.assetType || ""
      }
    };
  }

  public render() {
    return (
      <div>
        <div>
          <div>
            Recipient: <RecipientSelect onChange={this.handleRecipientChange} />{" "}
          </div>
        </div>
        <div>
          <div>
            Amount <input onChange={this.handleAmountChange} />{" "}
          </div>
        </div>
        <div>
          <div>
            AssetType{" "}
            <input
              onChange={this.handleAssetTypeChange}
              value={this.state.value.assetType}
            />{" "}
          </div>
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
      value: {
        recipient: {
          $set: recipient
        }
      }
    });
    this.setState(newState);
    this.emitChange(null, newState.value);
  };

  private handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const amount = Number.parseInt(value, 10);
    if (!isValidAmount(amount)) {
      const errors = update(this.state.errors, {
        amount: {
          $set: `The amount must be a positive integer but found ${amount}`
        }
      });
      this.setState({
        errors
      });
      return this.emitChange(errors);
    }
    const newState = update(this.state, {
      errors: {
        $unset: ["amount"]
      },
      value: {
        amount: {
          $set: amount
        }
      }
    });
    this.setState(newState);
    this.emitChange(null, newState.value);
  };

  private handleAssetTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // FIXME: Check whether value is H256 or not.
    const newState = update(this.state, {
      value: {
        assetType: {
          $set: value
        }
      }
    });
    this.setState(newState);
    this.emitChange(null, newState.value);
  };

  private emitChange = (
    err: InputGroupError | null,
    value?: TransferOutputInputGroupValue | null
  ) => {
    if (this.props.onChange) {
      this.props.onChange(err || {}, value);
    }
  };
}

function isValidAmount(val: number) {
  return Number.isNaN(val) === false && Number.isInteger(val) && val > 0;
}
