import * as React from "react";
import { Link } from "react-router-dom";

import { ApiClient } from "../api-client";

interface States {
  feePayer?: string | null;
  accounts: string[] | null;
  err: string | null;
}

export class AccountPage extends React.Component<{}, States> {
  constructor(props: {}) {
    super(props);

    this.state = {
      accounts: null,
      err: null
    };
  }

  public componentWillMount() {
    this.loadAccount();
    this.loadFeePayer();
  }

  public render() {
    const { accounts, err, feePayer } = this.state;
    if (err) {
      return <h1>Account Page errored: {err}</h1>;
    }
    if (accounts === null) {
      return <h1>loading</h1>;
    }
    return (
      <div>
        <h1>Account Page</h1>
        <br />
        Total {accounts.length} accounts
        <br />
        {accounts.map(a => (
          <div key={a}>
            <p>
              <input
                type="checkbox"
                checked={feePayer === a}
                onChange={e =>
                  this.handleFeePayerCheckClick(a, e.target.checked)
                }
              />
              <Link to={`account/${a}`}>{a}</Link>
              <button onClick={() => this.handleRemoveClick(a)}>x</button>
            </p>
          </div>
        ))}
        {accounts.length < 20 && (
          <button onClick={this.handleAddClick}>Generate</button>
        )}
      </div>
    );
  }

  private handleFeePayerCheckClick = (address: string, checked: boolean) => {
    if (checked) {
      new ApiClient()
        .setFeePayer(address)
        .then(() => {
          this.setState({ feePayer: address });
        })
        .catch(e => {
          this.setState({ err: String(e) });
        });
    } else {
      // FIXME: Not implemented
    }
  };

  private handleRemoveClick = (address: string) => {
    new ApiClient()
      .removeAccount(address)
      .then(() => {
        const { accounts } = this.state;
        if (accounts !== null) {
          this.setState({ accounts: accounts.filter(a => a !== address) });
        }
      })
      .catch(e => {
        this.setState({ err: String(e) });
      });
  };

  private handleAddClick = () => {
    new ApiClient()
      .createAccount()
      .then(account => {
        this.checkAccount(account);
        const { accounts } = this.state;
        if (accounts === null) {
          this.setState({ accounts: [account] });
        } else {
          this.setState({ accounts: [...accounts, account] });
        }
      })
      .catch(e => {
        this.setState({ err: String(e) });
      });
  };

  private loadAccount() {
    new ApiClient()
      .getAccountList()
      .then(({ accounts }) => {
        this.checkAccounts(accounts);
        this.setState({ accounts });
      })
      .catch(err => {
        this.setState({ err: String(err) });
      });
  }

  private loadFeePayer() {
    new ApiClient()
      .getFeePayer()
      .then(feePayer => {
        this.setState({ feePayer });
      })
      .catch(err => {
        this.setState({ err: String(err) });
      });
  }

  private checkAccount(account: any) {
    if (typeof account !== "string") {
      throw Error(`account must be a string`);
    }
  }

  private checkAccounts(accounts: any) {
    if (!Array.isArray(accounts)) {
      throw Error("accounts must be an array");
    }
    accounts.forEach(a => {
      if (typeof a !== "string") {
        throw Error(`account must be a string`);
      }
    });
  }
}
