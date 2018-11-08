import update from "immutability-helper";
import * as React from "react";

import {
  BasicMetadataInput,
  BasicMetadataInputValue
} from "./BasicMetadataInput";

export type MetadataInputValue =
  | {
      type: "basic";
      value: BasicMetadataInputValue;
    }
  | {
      type: "manual";
      value: string;
    };

interface Props {
  onChange?: (metadata: MetadataInputValue) => void;
  value?: MetadataInputValue;
}

interface States {
  value: MetadataInputValue;
}

export class MetadataInput extends React.Component<Props, States> {
  public static getDefaultValue = (
    type: "basic" | "manual" | string = "basic"
  ): MetadataInputValue => {
    switch (type) {
      case "basic":
        return {
          type,
          value: BasicMetadataInput.getDefaultValue()
        };
      case "manual":
        return { type, value: "" };
      default:
        throw Error("Unexpected type of MetadataInputValue");
    }
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      value: props.value || MetadataInput.getDefaultValue()
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.value) {
      this.setState({
        value: nextProps.value
      });
    }
  }

  public render() {
    const { value } = this.state;
    return (
      <>
        <select value={value.type} onChange={this.handleTypeChange}>
          <option value="basic">basic</option>
          <option value="manual">manual</option>
        </select>
        {value.type === "basic" && (
          <BasicMetadataInput
            value={value.value}
            onChange={this.handleBasicValueChange}
          />
        )}
        {value.type === "manual" && (
          <input value={value.value} onChange={this.handleManualValueChange} />
        )}
      </>
    );
  }

  private handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = MetadataInput.getDefaultValue(event.target.value);
    this.setState({
      value: newValue
    });
    this.emitChange(newValue);
  };

  private handleBasicValueChange = (value: BasicMetadataInputValue) => {
    if (this.state.value.type !== "basic") {
      throw Error(`Unexpected state`);
    }
    const newState = update(this.state, {
      value: {
        value: {
          $set: value
        }
      }
    });
    this.setState(newState);
    this.emitChange(newState.value);
  };

  private handleManualValueChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (this.state.value.type !== "manual") {
      throw Error(`Unexpected state`);
    }
    const newState = update(this.state, {
      value: {
        value: {
          $set: event.target.value
        }
      }
    });
    this.setState(newState);
    this.emitChange(newState.value);
  };

  private emitChange(value: MetadataInputValue) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }
}
