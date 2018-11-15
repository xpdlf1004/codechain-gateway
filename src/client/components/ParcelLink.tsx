import * as React from "react";

interface Props {
  parcelHash: string;
}

export class ParcelLink extends React.Component<Props> {
  public render() {
    const { parcelHash, children } = this.props;
    return (
      <>
        <a
          href={`https://husky.codechain.io/explorer/parcel/${parcelHash}`}
          target={`_blank`}
        >
          {children}
        </a>
      </>
    );
  }
}
