import * as React from "react";
import { Link } from "react-router-dom";
import { ApiClient } from "../api-client";

import {
  AssetTransferInputDoc,
  AssetTransferOutputDoc
} from "codechain-indexer-types/lib/types";
import { AssetTransferAddress } from "codechain-primitives/lib";
import { P2PKH } from "codechain-sdk/lib/key/P2PKH";
import { P2PKHBurn } from "codechain-sdk/lib/key/P2PKHBurn";

interface Props {
  assetType: string;
  ownerAddress: string;
  // FIXME: U256
  balance: number;
  transferable?: boolean;
}

interface States {
  pending?: {
    simulatedAmountChange: number;
    txs: string[];
  };
  err?: string;
}

export class AssetBalance extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  public componentDidMount() {
    this.loadPendingTransactions(this.props.ownerAddress);
  }

  public render() {
    const {
      assetType,
      ownerAddress,
      balance,
      transferable = false
    } = this.props;
    const { pending, err } = this.state;
    return (
      <>
        <span>{ownerAddress}</span>
        <span> ... </span>
        <span>{balance}</span>
        {transferable && (
          <Link to={`transfer?assetType=${assetType}&sender=${ownerAddress}`}>
            <button>transfer</button>
          </Link>
        )}
        {err && "errored while loading pending transactions"}
        {pending &&
          pending.txs.length > 0 && (
            <>
              -> {balance + pending.simulatedAmountChange} ({pending.txs.length}{" "}
              pending transactions:
              <>
                {pending.txs.map(tx => (
                  <>
                    <a
                      key={tx}
                      href={`https://husky.codechain.io/explorer/tx/${tx}`}
                      target="_blank"
                    >
                      {tx.substr(0, 6)}
                      ...
                    </a>
                    ,
                  </>
                ))}
              </>
              )
            </>
          )}
      </>
    );
  }

  private loadPendingTransactions(address: string) {
    return new ApiClient()
      .getPendingTransactionList(address)
      .then(({ transactions: items }) => {
        const result: {
          simulatedAmountChange: number;
          txs: string[];
        } = {
          simulatedAmountChange: 0,
          txs: []
        };
        items.forEach(item => {
          // FIXME: Update indexer-type package to properly use the type guard.
          if ("outputs" in item.transaction.data) {
            item.transaction.data.burns.map(b => {
              const burner = getAddressFromInputDoc(b);
              if (burner === address) {
                result.simulatedAmountChange -= b.prevOut.amount;
              }
            });
            item.transaction.data.inputs.map(i => {
              const spender = getAddressFromInputDoc(i);
              if (spender === address) {
                result.simulatedAmountChange -= i.prevOut.amount;
              }
            });
            item.transaction.data.outputs.map(o => {
              const recipient = getAddressFromOutputDoc(o);
              if (recipient === address) {
                result.simulatedAmountChange += o.amount;
              }
            });
            result.txs.push(item.transaction.data.hash);
          }
        });
        this.setState({
          pending: result
        });
      })
      .catch(err => {
        this.setState({
          err: String(err)
        });
      });
  }
}

const getAddressFromInputDoc = (input: AssetTransferInputDoc): string => {
  const { parameters, lockScriptHash } = input.prevOut;
  return getAddressFromLockScriptHashAndParameters(lockScriptHash, parameters);
};

const getAddressFromOutputDoc = (output: AssetTransferOutputDoc): string => {
  const { parameters, lockScriptHash } = output;
  return getAddressFromLockScriptHashAndParameters(lockScriptHash, parameters);
};

const getAddressFromLockScriptHashAndParameters = (
  lockScriptHash: string,
  parameters: Buffer[]
): string => {
  // FIXME: Don't hardcode the networkId
  const networkId = "tc";
  if (parameters.length === 0) {
    return AssetTransferAddress.fromTypeAndPayload(0, lockScriptHash, {
      networkId
    }).toString();
  } else if (parameters.length === 1) {
    if (lockScriptHash.replace(/^0x/, "") === P2PKH.getLockScriptHash().value) {
      return AssetTransferAddress.fromTypeAndPayload(
        1,
        Buffer.from(parameters[0]).toString("hex"),
        { networkId }
      ).toString();
    } else if (
      lockScriptHash.replace(/^0x/, "") === P2PKHBurn.getLockScriptHash().value
    ) {
      return AssetTransferAddress.fromTypeAndPayload(
        2,
        Buffer.from(parameters[0]).toString("hex"),
        { networkId }
      ).toString();
    }
  }
  throw Error(
    `Unexpected lockScriptHash and parameters: ${lockScriptHash} ${Buffer.from(
      parameters[0]
    ).toString("hex")}`
  );
};
