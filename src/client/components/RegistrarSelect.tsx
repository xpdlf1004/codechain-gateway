import * as React from "react";

import { PlatformAddress } from "codechain-primitives/lib";

import { RegistrarSelectValue } from "../../common/types/transactions";

interface Props {
  addresses?: PlatformAddress[];
  onChange?: (value: RegistrarSelectValue) => void;
  value?: RegistrarSelectValue;
}

export class RegistrarSelect extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const { addresses } = this.props;
    return (
      <>
        <select
          onChange={this.handleSelectChange}
          value={this.props.value && this.props.value.toString()}
        >
          <option value="none">None</option>
          {addresses &&
            addresses.map(a => (
              <option key={a.toString()} value={a.toString()}>
                {a.toString()}
              </option>
            ))}
          <option value="manual" disabled>
            Type manually (For advanced users) (Not implemented)
          </option>
        </select>
      </>
    );
  }

  private handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    this.setState({
      selectValue: event.target.value
    });

    if (event.target.value === "none") {
      return this.emitChange("none");
    }
    this.emitChange(PlatformAddress.fromString(event.target.value));
  };

  private emitChange = (address: RegistrarSelectValue) => {
    if (this.props.onChange) {
      this.props.onChange(address);
    }
  };
}
