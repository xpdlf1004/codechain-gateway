import * as React from "react";

import { PlatformAddress } from "codechain-primitives/lib";

import { RegistrarSelectValue } from "../../../common/types/transactions";
import { ApiClient } from "../../api-client";

import "./RegistrarSelect.css";

interface Props {
  onChange?: (value: RegistrarSelectValue) => void;
  value?: RegistrarSelectValue;
}

interface States {
  addresses?: string[];
  err?: string;
}

export class RegistrarSelect extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    this.state = {};
    this.loadRegistrar();
  }

  public render() {
    const { addresses, err } = this.state;
    return (
      <div className="registrar-select">
        <select
          className="form-control"
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
        {addresses === undefined && <span>Loading account list</span>}
        {err && <span>Errored while loading account list: {err}</span>}
      </div>
    );
  }

  private handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
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

  private loadRegistrar() {
    new ApiClient()
      .getAccountList()
      .then(({ accounts }) => {
        this.setState({
          addresses: accounts
        });
      })
      .catch(err => {
        this.setState({
          addresses: [],
          err
        });
      });
  }
}
