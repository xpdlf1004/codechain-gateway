import * as React from "react";

import { AssetRule } from "../../../common/types/rules";
import { ApiClient } from "../../api-client";

import Label from "reactstrap/lib/Label";
import "./AssetRuleEditor.css";

interface Props {
  assetType: string;
}

interface States {
  rule?: AssetRule;
  err?: string;
}

export class AssetRuleEditor extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.loadAssetRule();
  }

  public render() {
    const { rule, err } = this.state;
    if (err) {
      return <>Errored: {err}</>;
    }
    if (!rule) {
      return <>Loading ... </>;
    }
    return (
      <div className="asset-rule-editor d-flex align-items-center">
        <span>Transferrable through API</span>
        <Label className="switch mb-0 ml-3">
          <input
            type="checkbox"
            checked={rule.allowed}
            onChange={this.handleCheckboxChange}
          />
          <span className="slider" />
        </Label>
      </div>
    );
  }

  private handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.requestSetAssetRule({
      allowed: event.target.checked
    });
  };

  private loadAssetRule() {
    const { assetType } = this.props;
    new ApiClient()
      .getAssetRule(assetType)
      .then(rule => {
        this.setState({
          rule
        });
      })
      .catch(err => {
        this.setState({
          err: String(err)
        });
      });
  }

  private requestSetAssetRule(rule: AssetRule) {
    this.setState({
      rule: undefined
    });
    new ApiClient()
      .setAssetRule(this.props.assetType, rule)
      .then(() => {
        this.setState({
          rule
        });
      })
      .catch(err => {
        this.setState({
          err: String(err)
        });
      });
  }
}
