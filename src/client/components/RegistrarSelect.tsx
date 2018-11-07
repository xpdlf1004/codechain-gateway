import * as React from "react";

import { PlatformAddress } from "codechain-primitives/lib";

import { RegistrarSelectValue } from "../../common/types/transactions";

interface Props {
  addresses?: string[];
  onChange?: (err: string | null, address?: RegistrarSelectValue) => void;
}

interface States {
  showInput: boolean;
  addressInputValue: string;
}

export class RegistrarSelect extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showInput: false,
      addressInputValue: ""
    };
  }

  public render() {
    const { addresses } = this.props;
    const { addressInputValue, showInput } = this.state;
    return (
      <>
        <select onChange={this.handleSelectChange}>
          <option value="none">None</option>
          {addresses &&
            addresses.map(a => (
              <option key={a} value={a}>
                a
              </option>
            ))}
          <option value="manual">Type manually (For advanced users)</option>
        </select>
        {showInput && (
          <>
            <input
              value={addressInputValue}
              onChange={this.handleAddressInputChange}
            />
          </>
        )}
      </>
    );
  }

  private handleAddressInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({
      addressInputValue: e.target.value
    });
    try {
      this.emitChange(null, PlatformAddress.fromString(e.target.value));
    } catch (e) {
      this.emitChange(String(e));
    }
  };

  private handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // FIXME: Make sure that e.target.value is a correct usage.
    this.setState({
      showInput: e.target.value === "manual"
    });

    if (e.target.value === "none") {
      return this.emitChange(null, "none");
    }

    const input =
      e.target.value === "manual"
        ? this.state.addressInputValue
        : e.target.value;
    try {
      this.emitChange(null, PlatformAddress.fromString(input));
    } catch (e) {
      this.emitChange(String(e));
    }
  };

  private emitChange = (err: string | null, address?: RegistrarSelectValue) => {
    if (this.props.onChange) {
      this.props.onChange(err, address);
    }
  };
}
