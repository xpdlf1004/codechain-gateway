import update from "immutability-helper";
import * as React from "react";

export interface BasicMetadataInputValue {
  name: string;
  description: string;
  iconUrl: string;
}

interface Props {
  onChange?: (metadata: BasicMetadataInputValue) => void;
  value?: BasicMetadataInputValue;
}

interface States {
  value: BasicMetadataInputValue;
}

export class BasicMetadataInput extends React.Component<Props, States> {
  public static getDefaultValue = (): BasicMetadataInputValue => ({
    name: "",
    description: "",
    iconUrl: ""
  });

  constructor(props: Props) {
    super(props);

    this.state = {
      value: props.value || BasicMetadataInput.getDefaultValue()
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { value } = nextProps;
    if (value) {
      this.setState({
        value
      });
    }
  }

  public render() {
    const { name, description, iconUrl } = this.state.value;
    return (
      <fieldset>
        Name: <input value={name} onChange={this.handleNameChange} />
        <br />
        Description:
        <input value={description} onChange={this.handleDescriptionChange} />
        <br />
        Icon URL: <input value={iconUrl} onChange={this.handleIconUrlChange} />
      </fieldset>
    );
  }

  private handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = update(this.state.value, {
      name: {
        $set: event.target.value
      }
    });
    this.setState({ value: newValue });
    this.emitChange(newValue);
  };

  private handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = update(this.state.value, {
      description: {
        $set: event.target.value
      }
    });
    this.setState({ value: newValue });
    this.emitChange(newValue);
  };

  private handleIconUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = update(this.state.value, {
      iconUrl: {
        $set: event.target.value
      }
    });
    this.setState({ value: newValue });
    this.emitChange(newValue);
  };

  private emitChange = (value: BasicMetadataInputValue) => {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };
}
