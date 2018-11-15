import * as React from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ApiClient } from "../../api-client";

import "./AccountPage.css";

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
      return <h3>Account Page errored: {err}</h3>;
    }
    if (accounts === null) {
      return <h3>loading</h3>;
    }
    return (
      <div className="account-page">
        <h3>Account Page</h3>
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
                className="mr-2"
              />
              <Link to={`account/${a}`} className="link mono">
                {a}
              </Link>
              <div
                className="ml-2 d-inline-block remove-btn"
                onClick={() => this.handleRemoveClick(a)}
              >
                <FontAwesomeIcon icon="trash" />
              </div>
            </p>
          </div>
        ))}
        {accounts.length < 20 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleAddClick}
          >
            Generate
          </button>
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
