import * as React from "react";

interface States {
  accounts: string[] | null;
  err: string | null;
}

export class Account extends React.Component<{}, States> {
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
      <h1>
        Account Page
        <br />
        {accounts.length}
      </h1>
    );
  }

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
