import * as React from "react";
// import styles from './Fieldhub365.module.scss';
import type { IFieldhub365Props } from "./IFieldhub365Props";
// import { escape } from '@microsoft/sp-lodash-subset';
import "../assets/css/font.css";
import "./Fieldhub.css";

import { sp } from "@pnp/sp/presets/all";
import { graph } from "@pnp/graph/presets/all";
import MobileLayout from "./MobileLayout/MobileLayout";
import { HashRouter } from "react-router-dom";

export default class Fieldhub365 extends React.Component<
  IFieldhub365Props,
  {}
> {
  constructor(prop: IFieldhub365Props) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
    graph.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }
  public render(): React.ReactElement<IFieldhub365Props> {
    return (
      <div>
        <HashRouter>
          <div className="App">
            <MobileLayout SpContext={this.props.context} graphContext={graph} />
            {/* <div>Loading</div> */}
          </div>
        </HashRouter>
      </div>
    );
  }
}
