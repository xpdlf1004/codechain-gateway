import * as React from "react";

import { AssetTransferAddress, H160 } from "codechain-primitives/lib";

import { RecipientSelectValue } from "../../../common/types/transactions";

import "./RecipientSelect.css";

interface Props {
  addresses?: string[];
  onChange?: (err: string | null, recipient?: RecipientSelectValue) => void;
}

interface States {
  showAddressInput: boolean;
  manualInputAddress: string;
  showLockScriptHashInput: boolean;
  lockScriptHash: string;
}

export class RecipientSelect extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showLockScriptHashInput: false,
      showAddressInput: false,
      lockScriptHash: "",
      manualInputAddress: ""
    };
  }

  public render() {
    const { showLockScriptHashInput, showAddressInput } = this.state;
    return (
      <div className="recipient-select">
        <select className="form-control" onChange={this.handleSelectChange}>
          <option value="create">Create a new address</option>
          <option value="manual">Type manually</option>
          <option value="address">LockScriptHash (For advanced users)</option>
        </select>
        {showLockScriptHashInput && (
          <span>
            LockScriptHash:
            <input
              onChange={this.handleLockScriptHashChange}
              value={this.state.lockScriptHash}
            />
            Parameters:
            <input disabled title="Not implemented yet" />
          </span>
        )}
        {showAddressInput && (
          <span>
            <input
              onChange={this.handleManualAddressInputChange}
              value={this.state.manualInputAddress}
            />
          </span>
        )}
      </div>
    );
  }

  private handleManualAddressInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({
      manualInputAddress: event.target.value
    });
    try {
      this.emitChange(null, {
        type: "address",
        address: AssetTransferAddress.ensure(event.target.value)
      });
    } catch (err) {
      this.emitChange(
        `"${event.target.value}" is not an asset transfer address`
      );
    }
  };

  private handleLockScriptHashChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({
      lockScriptHash: event.target.value
    });
    if (H160.check(event.target.value)) {
      this.emitChange(null, {
        type: "lock-script-hash",
        lockScriptHash: H160.ensure(event.target.value),
        parameters: []
      });
    } else {
      this.emitChange(`"${event.target.value}" is not a lock script hash`);
    }
  };

  private handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    this.setState({
      showLockScriptHashInput: event.target.value === "address",
      showAddressInput: event.target.value === "manual"
    });
    let recipient: RecipientSelectValue;

    switch (event.target.value) {
      case "create":
        recipient = { type: "create" };
        break;
      case "manual":
        try {
          recipient = {
            type: "address",
            address: AssetTransferAddress.ensure(this.state.manualInputAddress)
          };
        } catch (err) {
          return this.emitChange(
            `"${event.target.value}" is not an asset transfer address`
          );
        }
        break;
      case "address":
        if (!H160.check(this.state.lockScriptHash)) {
          return this.emitChange(
            `"${this.state.lockScriptHash}" is not a lock script hash`
          );
        }
        recipient = {
          type: "lock-script-hash",
          lockScriptHash: H160.ensure(this.state.lockScriptHash),
          parameters: []
        };
        break;
      default:
        recipient = {
          type: "address",
          address: AssetTransferAddress.fromString(event.target.value)
        };
        break;
    }
    this.emitChange(null, recipient);
  };

  private emitChange = (
    err: string | null,
    recipient?: RecipientSelectValue
  ) => {
    if (this.props.onChange) {
      this.props.onChange(err, recipient);
    }
  };
}
