import update from "immutability-helper";
import * as React from "react";

import {
  BasicMetadataInput,
  BasicMetadataInputValue
} from "../BasicMetadataInput/BasicMetadataInput";

import { Label } from "reactstrap";
import "./MetadataInput.css";

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
      <div className="metadata-input">
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="basic"
            id="basic-input"
            value="basic"
            checked={value.type === "basic"}
            onChange={this.handleTypeChange}
          />
          <Label className="form-check-label" for="basic-input">
            Basic
          </Label>
        </div>
        {value.type === "basic" && (
          <BasicMetadataInput
            value={value.value}
            onChange={this.handleBasicValueChange}
          />
        )}
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="manual"
            id="manual-input"
            value="manual"
            checked={value.type === "manual"}
            onChange={this.handleTypeChange}
          />
          <Label className="form-check-label" for="manual-input">
            Manual
          </Label>
        </div>
        {value.type === "manual" && (
          <div className="manual-input">
            <textarea
              className="form-control"
              placeholder="Enter metadata string"
              value={value.value}
              onChange={this.handleManualValueChange}
              rows={5}
            />
          </div>
        )}
      </div>
    );
  }

  private handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    event: React.ChangeEvent<HTMLTextAreaElement>
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
