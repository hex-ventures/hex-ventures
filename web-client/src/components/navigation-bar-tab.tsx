// React
import * as React from "react";

// Components
import { Link } from "react-router-dom";

// Router
import { withRouter, RouteComponentProps } from "react-router";

interface Props extends RouteComponentProps<Object> {
  title: string;
  isActiveBackgroundColor: string;
  isInactiveColor: string;
}

interface State {
  isActive: boolean;
}

class NavigationBarTab extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isActive: false
    };
  }

  isMatch() {
    if (this.props.location.pathname.startsWith(`/${this.props.title}`)) {
      return true;
    }
    if (
      this.props.title === "capture" &&
      this.props.location.pathname === "/"
    ) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <div className={`dtc w-third`}>
        <Link
          to={`/${this.props.title}`}
          style={{
            textDecoration: "none"
          }}
        >
          <div
            className={`dt tc pointer w-100 h2 pa3 bw1 b--${
              this.props.isActiveBackgroundColor
            } ttl ${this.isMatch() ? "bb" : ""}`}
          >
            <span
              className={`dtc v-mid ${
                this.isMatch() ? this.props.isInactiveColor : "gray"
              }`}
            >
              {this.props.title}
            </span>
          </div>
        </Link>
      </div>
    );
  }
}

export default withRouter(NavigationBarTab);
