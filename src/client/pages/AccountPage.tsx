import * as React from "react";
import { Link } from "react-router-dom";

interface States {
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
  }

  public render() {
    const { accounts, err } = this.state;
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
              <Link to={`account/${a}`}>{a}</Link>
              <button onClick={() => this.onClickRemove(a)}>x</button>
            </p>
          </div>
        ))}
        {accounts.length < 20 && (
          <button onClick={this.onClickAdd}>Generate</button>
        )}
      </div>
    );
  }

  private onClickRemove = (address: string) => {
    fetch(`//localhost:4000/account/${address}`, { method: "DELETE" })
      .then(_ => {
        const { accounts } = this.state;
        if (accounts !== null) {
          this.setState({ accounts: accounts.filter(a => a !== address) });
        }
      })
      .catch(e => {
        this.setState({ err: String(e) });
      });
  };

  private onClickAdd = () => {
    fetch("//localhost:4000/account/new", { method: "POST" })
      .then(response => response.json())
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
    fetch("//localhost:4000/account/list")
      .then(response => response.json())
      .then(({ accounts }) => {
        this.checkAccounts(accounts);
        this.setState({ accounts });
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
