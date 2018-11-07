import * as React from "react";

import { PlatformAddress } from "codechain-primitives/lib";

import { RegistrarSelectValue } from "../../common/types/transactions";

interface Props {
  addresses?: string[];
  onChange?: (err: string | null, address?: RegistrarSelectValue) => void;
}

interface States {
  selectValue: "none" | string;
}

export class RegistrarSelect extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectValue: "none"
    };
  }

  public render() {
    const { addresses } = this.props;
    const { selectValue } = this.state;
    return (
      <>
        <select onChange={this.handleSelectChange} value={selectValue}>
          <option value="none">None</option>
          {addresses &&
            addresses.map(a => (
              <option key={a} value={a}>
                a
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
      return this.emitChange(null, "none");
    }

    try {
      this.emitChange(null, PlatformAddress.fromString(event.target.value));
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
