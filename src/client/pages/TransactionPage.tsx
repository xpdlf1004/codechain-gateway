import * as React from "react";

import { Transaction } from "../../common/types/transactions";
import { ApiClient } from "../api-client";

interface States {
  transactions?: Transaction[] | null;
  err?: string | null;
}

export class TransactionPage extends React.Component<{}, States> {
  constructor(props: {}) {
    super(props);

    this.state = {};
  }
  public componentWillMount() {
    this.loadTransactions();
  }

  public render() {
    const { transactions, err } = this.state;
    if (err) {
      return <div>Error: {err}</div>;
    }
    if (!transactions) {
      return <div>Loading ... </div>;
    }
    return (
      <div>
        TransactionPage
        <table>
          <thead>
            <tr>
              <th>Created</th>
              <th>Type</th>
              <th>Origin</th>
              <th>Status (not implemented)</th>
              <th>TxHash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.txhash}>
                <td>{new Date(tx.created).toLocaleString()}</td>
                <td>{tx.tx.type.replace(/^asset/, "")}</td>
                <td>{tx.origin}</td>
                <td>{tx.status}</td>
                <td title={tx.txhash}>
                  0x
                  {tx.txhash.substr(0, 6)}
                  ...
                  <a
                    href={`https://husky.codechain.io/explorer/tx/0x${
                      tx.txhash
                    }`}
                    target="_blank"
                  >
                    Explorer
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  private loadTransactions() {
    new ApiClient()
      .getTransactionList()
      .then(({ transactions }) => {
        this.setState({
          transactions
        });
      })
      .catch(e => {
        console.error(e);
        this.setState({ err: String(e) });
      });
  }
}
