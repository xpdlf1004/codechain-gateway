import * as React from "react";

import { Transaction } from "../../common/types/transactions";
import { ApiClient } from "../api-client";
import { TransactionLink } from "../components/TransactionLink";

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
              <th>Status</th>
              <th>TxHash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.txhash}>
                <td>{new Date(tx.created).toLocaleString()}</td>
                <td>{tx.tx.type.replace(/^asset/, "")}</td>
                <td>{tx.origin}</td>
                <td
                  title={"reason" in tx.status ? tx.status.reason : undefined}
                >
                  {tx.status.type}
                </td>
                <td title={tx.txhash}>
                  0x
                  {tx.txhash.substr(0, 6)}
                  ...
                  <TransactionLink txhash={tx.txhash}>Explorer</TransactionLink>
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
