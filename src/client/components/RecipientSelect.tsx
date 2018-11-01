import * as React from "react";

import { AssetTransferAddress, H160 } from "codechain-primitives/lib";

import { RecipientSelectValue } from "../../common/types/transactions";

interface Props {
  addresses?: string[];
  onChange?: (err: string | null, recipient?: RecipientSelectValue) => void;
}

interface States {
  showNonAddressInputs: boolean;
  lockScriptHash: string;
}

export class RecipientSelect extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showNonAddressInputs: false,
      lockScriptHash: ""
    };
  }

  public render() {
    const { showNonAddressInputs } = this.state;
    return (
      <div>
        <select onChange={this.handleSelectChange}>
          <option value="create">Create a new address</option>
          <option value="address">LockScriptHash (For advanced users)</option>
        </select>
        {showNonAddressInputs && (
          <div>
            LockScriptHash:
            <input
              onChange={this.handleLockScriptHashChange}
              value={this.state.lockScriptHash}
            />
            <br />
            Parameters:
            <input disabled title="Not implemented yet" />
          </div>
        )}
      </div>
    );
  }

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
      showNonAddressInputs: e.target.value === "address"
    });
    let recipient: RecipientSelectValue;

    switch (e.target.value) {
      case "create":
        recipient = "create";
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
