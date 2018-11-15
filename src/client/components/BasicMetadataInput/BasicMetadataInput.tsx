import update from "immutability-helper";
import * as React from "react";
import Dropzone, { DropFileEventHandler } from "react-dropzone";
import { ApiClient } from "../../api-client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Label from "reactstrap/lib/Label";
import "./BasicMetadataInput.css";

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
  uploadedImageUrl?: string;
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
    const { uploadedImageUrl } = this.state;
    const { name, description, iconUrl } = this.state.value;
    return (
      <div className="basic-metadata-input d-flex">
        <div className="flex-shrink-1 flex-grow-1 align-items-center">
          <div className="form-group">
            <Label for="name-input">Name</Label>
            <input
              type="text"
              className="form-control"
              id="name-input"
              placeholder="Enter asset name"
              value={name}
              onChange={this.handleNameChange}
            />
          </div>
          <div className="form-group">
            <Label for="description-input">Description</Label>
            <textarea
              className="form-control"
              id="description-input"
              placeholder="Enter asset description"
              value={description}
              rows={3}
              onChange={this.handleDescriptionChange}
            />
          </div>
          <div className="form-group">
            <Label for="url-input">Icon URL</Label>
            <input
              type="text"
              className="form-control"
              id="url-input"
              placeholder="Enter asset description"
              value={iconUrl}
              onChange={this.handleIconUrlChange}
              disabled={!!uploadedImageUrl}
            />
          </div>
        </div>
        <div className="d-flex align-items-center image-loader-container">
          <Dropzone
            accept={"image/*"}
            onDropAccepted={this.handleImageDrop}
            multiple={false}
          >
            {uploadedImageUrl ? (
              <div className="preview-container d-flex align-items-center justify-content-center">
                <div>
                  <div className="d-flex justify-content-center mb-3 mt-3">
                    <img src={uploadedImageUrl} className="uploaded-image" />
                  </div>
                  <div>
                    <button
                      onClick={this.handleUploadedImageRemoveClick}
                      className="btn btn-secondary"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="drop-text d-flex align-items-center justify-content-center">
                <div>
                  <div className="text-center mb-2">
                    <FontAwesomeIcon
                      className="drop-image-icon"
                      icon={["far", "file-image"]}
                    />
                  </div>
                  Drop an image here
                </div>
              </div>
            )}
          </Dropzone>
        </div>
      </div>
    );
  }

  private handleUploadedImageRemoveClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    this.setState({
      uploadedImageUrl: undefined
    });
    this.updateIconUrl("");
  };

  private handleImageDrop: DropFileEventHandler = ([file]) => {
    new ApiClient().uploadImage(file).then(({ url }) => {
      this.setState({
        uploadedImageUrl: url
      });
      this.updateIconUrl(url);
    });
  };

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
    event: React.ChangeEvent<HTMLTextAreaElement>
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
    this.updateIconUrl(event.target.value);
  };

  private updateIconUrl = (url: string) => {
    const newValue = update(this.state.value, {
      iconUrl: {
        $set: url
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
