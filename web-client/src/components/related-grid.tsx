// React
import * as React from "react";

// Router
import { RouteComponentProps } from "react-router";

// GraphQL
import {
  getRelatedCapturesBySessionQuery as getRelatedCapturesBySessionResponse,
  getRelatedCapturesBySessionQueryVariables
} from "../__generated__/types";

import { getRelatedCapturesBySession } from "../queries";
import { graphql, compose, QueryProps } from "react-apollo";

// Components
import GridCaptures from "../components/grid-captures";
import HeaderSurface from "../components/header-surface";
import ReactResizeDetector from "react-resize-detector";

// Utils

// Types

interface RouteProps extends RouteComponentProps<{}> {}

interface Props extends RouteProps {
  data: QueryProps<getRelatedCapturesBySessionQueryVariables> &
    Partial<getRelatedCapturesBySessionResponse>;
}

interface State {
  headerHeight: number;
}

// Class
class RelatedGrid extends React.Component<Props, State> {
  constructor(nextProps: Props) {
    super(nextProps);

    this.state = {
      headerHeight: 0
    };
  }

  render() {
    const relatedCaptures = this.props.data.getRelatedCapturesBySession;

    if (!relatedCaptures) {
      return <div />;
    }

    return (
      <div className={`flex-column`}>
        <div>
          <ReactResizeDetector
            handleHeight={true}
            onResize={(_, height) => {
              this.setState({
                headerHeight: height
              });
            }}
          />
          <HeaderSurface isGraphView={false} />
        </div>
        <GridCaptures
          captures={relatedCaptures.items}
          headerHeight={this.state.headerHeight}
        />
      </div>
    );
  }
}

const withGetRelatedCapturesBySession = graphql<
  getRelatedCapturesBySessionResponse,
  Props
>(getRelatedCapturesBySession, {
  alias: "withGetRelatedCapturesBySession",
  options: (props: Props) => ({
    variables: {
      sessionId: decodeURIComponent(props.match.params["id"]),
      count: 5
    },
    fetchPolicy: "network-only"
  })
});

const RelatedGridWithData = compose(withGetRelatedCapturesBySession)(
  RelatedGrid
);

// Export
export default RelatedGridWithData;
