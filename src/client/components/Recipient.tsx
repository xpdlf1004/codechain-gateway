import * as React from "react";

type AssetTransferAddress = string;
interface Props {
  addresses?: string[];
  onChange?: (
    err: string | null,
    recipient:
      | "create"
      | AssetTransferAddress
      | {
          lockScriptHash: string;
          parameters: Buffer[];
        }
  ) => void;
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
              value="lockScriptHash"
            />
            <br />
            Parameters (not implemented):
            <input disabled />
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
  };

  private handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // FIXME: Make sure that e.target.value is a correct usage.
    this.setState({
      showNonAddressInputs: e.target.value === "address"
    });
    let recipient:
      | "create"
      | AssetTransferAddress
      | {
          lockScriptHash: string;
          parameters: Buffer[];
        };

    switch (e.target.value) {
      case "create":
        recipient = "create";
        break;
      case "address":
        recipient = {
          lockScriptHash: this.state.lockScriptHash,
          parameters: []
        };
        break;
      default:
        recipient = e.target.value;
        break;
    }
    this.emitChange(null, recipient);
  };

  private emitChange = (
    err: string | null,
    recipient:
      | "create"
      | AssetTransferAddress
      | {
          lockScriptHash: string;
          parameters: Buffer[];
        }
  ) => {
    if (this.props.onChange) {
      this.props.onChange(err, recipient);
    }
  };
}