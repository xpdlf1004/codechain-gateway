import * as React from "react";

interface Props {
  addresses?: string[];
  onChange?: (err: string | null, address: string) => void;
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
      <div>
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
          <div>
            Address:
            <input
              value={addressInputValue}
              onChange={this.handleAddressInputChange}
            />
          </div>
        )}
      </div>
    );
  }

  private handleAddressInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({
      addressInputValue: e.target.value
    });
  };

  private handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // FIXME: Make sure that e.target.value is a correct usage.
    this.setState({
      showInput: e.target.value === "manual"
    });

    if (e.target.value === "manual") {
      this.emitChange(null, this.state.addressInputValue);
    } else {
      this.emitChange(null, e.target.value);
    }
  };

  private emitChange = (err: string | null, address: string) => {
    if (this.props.onChange) {
      this.props.onChange(err, address);
    }
  };
}
