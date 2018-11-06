import * as React from "react";

import { AssetTransferAddress, H160 } from "codechain-primitives/lib";

import { RecipientSelectValue } from "../../common/types/transactions";

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
      <div>
        <select onChange={this.handleSelectChange}>
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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({
      manualInputAddress: e.target.value
    });
    try {
      this.emitChange(null, AssetTransferAddress.ensure(e.target.value));
    } catch (err) {
      this.emitChange(`"${e.target.value}" is not an asset transfer address`);
    }
  };

  private handleLockScriptHashChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({
      lockScriptHash: e.target.value
    });
    if (H160.check(e.target.value)) {
      this.emitChange(null, {
        lockScriptHash: H160.ensure(e.target.value),
        parameters: []
      });
    } else {
      this.emitChange(`"${e.target.value}" is not a lock script hash`);
    }
  };

  private handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // FIXME: Make sure that e.target.value is a correct usage.
    this.setState({
      showLockScriptHashInput: e.target.value === "address",
      showAddressInput: e.target.value === "manual"
    });
    let recipient: RecipientSelectValue;

    switch (e.target.value) {
      case "create":
        recipient = "create";
        break;
      case "manual":
        try {
          recipient = AssetTransferAddress.ensure(
            this.state.manualInputAddress
          );
        } catch (err) {
          return this.emitChange(
            `"${e.target.value}" is not an asset transfer address`
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
          lockScriptHash: H160.ensure(this.state.lockScriptHash),
          parameters: []
        };
        break;
      default:
        recipient = AssetTransferAddress.fromString(e.target.value);
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
