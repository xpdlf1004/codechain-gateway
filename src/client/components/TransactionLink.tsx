import * as React from "react";

interface Props {
  txhash: string;
}

export class TransactionLink extends React.Component<Props> {
  public render() {
    const { txhash, children } = this.props;
    return (
      <>
        <a
          href={`https://husky.codechain.io/explorer/tx/${txhash}`}
          target={`_blank`}
        >
          {children}
        </a>
      </>
    );
  }
}
