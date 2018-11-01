import * as React from "react";

interface Props {
  addresses: string[];
  onChange?: (err: string | null, address: string) => void;
}

export class FeePayerSelect extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const { addresses } = this.props;
    if (addresses.length === 0) {
      // FIXME: disabled select
      return <div>No fee payer available</div>;
    }
    return (
      <select onChange={this.handleSelectChange}>
        {addresses.map(a => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    );
  }

  private handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // FIXME: Make sure that e.target.value is a correct usage.
    this.emitChange(null, e.target.value);
  };

  private emitChange(err: string | null, address: string) {
    if (this.props.onChange) {
      this.props.onChange(err, address);
    }
  }
}
