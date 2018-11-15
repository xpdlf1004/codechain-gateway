import * as React from "react";

import { ApiClient } from "../../api-client";

import "./FeePayerSelect.css";

interface Payer {
  candidates: string[];
  feePayer: string | null;
}

interface Props {
  onChange?: (address: string) => void;
}

interface States {
  selected?: string;
  payer?: Payer;
  err?: string;
}

export class FeePayerSelect extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.load()
      .then(payer => {
        this.setState({
          payer
        });
        if (payer.feePayer) {
          this.setState({
            selected: payer.feePayer
          });
          this.emitChange(payer.feePayer);
        }
      })
      .catch(err => {
        this.setState({
          err: String(err)
        });
      });
  }

  public render() {
    const { payer, err } = this.state;
    if (err) {
      return <>Errored while loading fee payer</>;
    }
    if (!payer) {
      return (
        <>
          <select>
            <option disabled>Loading fee payer ... </option>
          </select>
        </>
      );
    }
    const { candidates, feePayer } = payer;
    return (
      <div className="fee-payer-select">
        <select
          onChange={this.handleSelectChange}
          className="form-control"
          value={this.state.selected}
        >
          {candidates.map(address => (
            <option key={address} value={address}>
              {address}
              {feePayer === address && "(default)"}
            </option>
          ))}
        </select>
      </div>
    );
  }

  private handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      selected: e.target.value
    });
    this.emitChange(e.target.value);
  };

  private emitChange(address: string) {
    if (this.props.onChange) {
      this.props.onChange(address);
    }
  }

  private load(): Promise<Payer> {
    const client = new ApiClient();
    return Promise.all([client.getAccountList(), client.getFeePayer()]).then(
      ([{ accounts: candidates }, feePayer]) => {
        return {
          candidates,
          feePayer
        };
      }
    );
  }
}
