// React
import * as React from "react";

// GraphQL
import {
  // Captured Today
  capturedTodayQuery as capturedTodayResponse,
  capturedTodayQueryVariables,
  // Search
  searchQuery as searchResponse,
  searchQueryVariables,
  // Detailed
  getDetailedQuery as getDetailedResponse,
  getDetailedQueryVariables,
  // Create Capture
  createCaptureMutation as createCaptureResponse,
  createCaptureMutationVariables,
  // Archive Capture
  archiveCaptureMutation as archiveCaptureResponse,
  archiveCaptureMutationVariables,
  // Edit Capture
  editCaptureMutation as editCaptureResponse,
  editCaptureMutationVariables
} from "../__generated__/types";
import {
  capturedToday,
  search,
  getDetailed,
  createCapture,
  archiveCapture,
  editCapture
} from "../queries";
import { graphql, compose, QueryProps, MutationFunc } from "react-apollo";

// Router
import { RouteComponentProps } from "react-router";

// Components
import List from "../components/list";
import GraphVisualization from "../components/graph-visualization";

// Utils
import {
  getIsLargeWindow,
  getCurrentLocation,
  getQuery,
  getId
} from "../utils";
import { noop, trim, assign } from "lodash";
import windowSize from "react-window-size";

// Types
import { Location } from "../types";

interface RouteProps extends RouteComponentProps<{}> {}

interface Props extends RouteProps {
  // Queries
  capturedToday?: QueryProps<capturedTodayQueryVariables> &
    Partial<capturedTodayResponse>;
  search?: QueryProps<searchQueryVariables> & Partial<searchResponse>;
  getDetailed?: QueryProps<getDetailedQueryVariables> &
    Partial<getDetailedResponse>;
  // Mutations
  createCapture: MutationFunc<
    createCaptureResponse,
    createCaptureMutationVariables
  >;
  archiveCapture: MutationFunc<
    archiveCaptureResponse,
    archiveCaptureMutationVariables
  >;
  editCapture: MutationFunc<editCaptureResponse, editCaptureMutationVariables>;
  // Window Size
  windowWidth: number;
  windowHeight: number;
}

interface CaptureState {
  isMore: boolean;
  isEditing: boolean;
  isShowingRelated: boolean;
}

interface State {
  // Header
  isCapturing: boolean;
  captureText: string;
  surfaceText: string;
  // Captures
  captures: Map<string, CaptureState>;
  scrollToId?: string;
}

// Class
class Main extends React.Component<Props, State> {
  constructor(nextProps: Props) {
    super(nextProps);

    this.state = {
      isCapturing:
        getCurrentLocation(nextProps.location.search) ===
        Location.CapturedToday,
      captureText: "",
      surfaceText: getQuery(nextProps.location.search),
      captures: new Map<string, CaptureState>()
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      isCapturing:
        getCurrentLocation(nextProps.location.search) ===
        Location.CapturedToday,
      surfaceText: getQuery(nextProps.location.search)
    });
  }

  createCaptureState = (id: string): CaptureState => {
    let captureState = {
      isMore: false,
      isEditing: false,
      isShowingRelated: false,
      text: ""
    };

    return captureState;
  };

  render() {
    let isLoading;
    let data;
    let refetch;

    if (this.props.capturedToday) {
      isLoading = this.props.capturedToday.loading;
      data = this.props.capturedToday.getAll;
      refetch = this.props.capturedToday.refetch;
    }

    if (this.props.search) {
      isLoading = this.props.search.loading;
      data = this.props.search.search;
      refetch = this.props.search.refetch;
    }

    if (this.props.getDetailed) {
      isLoading = this.props.getDetailed.loading;
      data = this.props.getDetailed.getDetailed;
      refetch = this.props.getDetailed.refetch;
    }

    let isLargeWindow = getIsLargeWindow(this.props.windowWidth);

    return (
      <div className={`flex w-100 vh-100`}>
        {/* List */}
        <div
          className={`shadow-1`}
          style={{
            minWidth: isLargeWindow ? "35em" : "100%",
            maxWidth: isLargeWindow ? "35em" : "100%"
          }}
        >
          <List
            // List
            isHidden={false}
            handleIsHidden={noop}
            listData={isLoading ? [] : data.list}
            scrollToId={this.state.scrollToId}
            // Session
            sessionId={undefined}
            sessionTitle={undefined}
            sessionTags={undefined}
            sessionIsEditingTags={false}
            sessionIsEditingTitle={false}
            sessionHandleEditTags={noop}
            sessionHandleEditTitle={noop}
            sessionHandleClose={noop}
            // Header
            handleHeaderCaptureTextChange={nextCaptureText => {
              this.setState({
                captureText: nextCaptureText
              });
            }}
            handleHeaderCapture={() => {
              if (!this.state.captureText) {
                return;
              }
              this.props
                .createCapture({
                  variables: {
                    body: this.state.captureText
                  }
                })
                .then(() => {
                  refetch();
                })
                .catch(err => console.error(err));
            }}
            handleHeaderExpand={noop}
            isHeaderCapturing={this.state.isCapturing}
            handleHeaderIsCapturing={() => {
              this.setState({
                isCapturing: !this.state.isCapturing
              });
            }}
            handleSurfaceTextChange={nextSurfaceText => {
              this.setState({
                surfaceText: nextSurfaceText
              });
            }}
            handleSurface={() => {
              let query = trim(this.state.surfaceText);
              if (!query) {
                return;
              }
              this.props.history.push(`?query=${encodeURIComponent(query)}`);
            }}
            handleSurfaceClear={() => {
              this.props.history.push(`/`);
            }}
            surfaceStartingText={getQuery(this.props.location.search)}
            headerPaddingText={
              this.state.isCapturing
                ? this.state.captureText
                : this.state.surfaceText
            }
            footerPaddingText={""}
            // Captures
            handleExpand={(id: string) => noop}
            handleIsShowingRelated={(id: string) => () => {
              let captureState = this.state.captures.get(id);
              if (!captureState) {
                captureState = this.createCaptureState(id);
              }
              let nextCaptureState = assign(captureState, {
                isShowingRelated: !captureState.isShowingRelated
              });
              let nextCaptures = this.state.captures.set(id, nextCaptureState);
              this.setState({
                captures: nextCaptures
              });
            }}
            isShowingRelated={(id: string) => {
              let captureState = this.state.captures.get(id);
              if (!captureState) {
                captureState = this.createCaptureState(id);
              }
              return captureState.isShowingRelated;
            }}
            handleMore={(id: string) => () => {
              let captureState = this.state.captures.get(id);
              if (!captureState) {
                captureState = this.createCaptureState(id);
              }
              let nextCaptureState = assign(captureState, {
                isMore: !captureState.isMore
              });
              let nextCaptures = this.state.captures.set(id, nextCaptureState);
              this.setState({
                captures: nextCaptures
              });
            }}
            isMore={(id: string) => {
              let captureState = this.state.captures.get(id);
              if (!captureState) {
                captureState = this.createCaptureState(id);
              }
              return captureState.isMore;
            }}
            handleComment={(id: string) => noop}
            handleFocus={(id: string) => () => {
              this.props.history.push(`?id=${encodeURIComponent(id)}`);
            }}
            handleEdit={(id: string) => text => {
              let captureState = this.state.captures.get(id);
              if (!captureState) {
                captureState = this.createCaptureState(id);
              }
              let nextCaptureState = assign(captureState, {
                isEditing: !captureState.isEditing
              });
              let nextCaptures = this.state.captures.set(id, nextCaptureState);

              if (!captureState.isEditing) {
                this.props
                  .editCapture({
                    variables: { id, body: text }
                  })
                  .then(() => {
                    refetch();
                  })
                  .then(() => {
                    this.setState({
                      captures: nextCaptures
                    });
                  })
                  .catch(err => console.error(err));
              } else {
                this.setState({
                  captures: nextCaptures
                });
              }
            }}
            isEditing={(id: string) => {
              let captureState = this.state.captures.get(id);
              if (!captureState) {
                captureState = this.createCaptureState(id);
              }
              return captureState.isEditing;
            }}
            handleArchive={(id: string) => () => {
              this.props
                .archiveCapture({
                  variables: { id }
                })
                .then(() => {
                  refetch();
                })
                .catch(err => console.error(err));
            }}
          />
        </div>

        {/* Graph */}
        {isLargeWindow ? (
          <div className={`flex-grow`}>
            <GraphVisualization
              refEChart={noop}
              nodes={isLoading ? [] : data.graph.nodes}
              edges={isLoading ? [] : data.graph.edges}
              onClick={e => {
                this.props.history.push(`?id=${encodeURIComponent(e.data.id)}`);
              }}
              onMouseOver={e => {
                this.setState({
                  scrollToId: e.data.id
                });
              }}
              onMouseOut={noop}
              showTooltip={false}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

// GraphQL Queries and Mutations
const withCapturedToday = graphql<capturedTodayResponse, Props>(capturedToday, {
  name: "capturedToday",
  alias: "withCapturedToday",
  skip: (props: Props) =>
    getCurrentLocation(props.location.search) !== Location.CapturedToday,
  options: {
    variables: {
      timezoneOffset: new Date().getTimezoneOffset() / 60 * -1
    }
  }
});

const withSearch = graphql<searchResponse, Props>(search, {
  name: "search",
  alias: "withSearch",
  skip: (props: Props) =>
    getCurrentLocation(props.location.search) !== Location.Search,
  options: (props: Props) => ({
    variables: {
      rawQuery: getQuery(props.location.search)
    }
  })
});

const withGetDetailed = graphql<getDetailedResponse, Props>(getDetailed, {
  name: "getDetailed",
  alias: "withGetDetailed",
  skip: (props: Props) =>
    getCurrentLocation(props.location.search) !== Location.Detail,
  options: (props: Props) => ({
    variables: {
      id: getId(props.location.search)
    }
  })
});

const withCreateCapture = graphql<createCaptureResponse, Props>(createCapture, {
  name: "createCapture",
  alias: "withCreateCapture"
});

const withArchiveCapture = graphql<archiveCaptureResponse, Props>(
  archiveCapture,
  {
    name: "archiveCapture",
    alias: "withArchiveCapture"
  }
);

const withEditCapture = graphql<editCaptureResponse, Props>(editCapture, {
  name: "editCapture",
  alias: "withEditCapture"
});

const MainWithData = compose(
  withCapturedToday,
  withSearch,
  withGetDetailed,
  withCreateCapture,
  withEditCapture,
  withArchiveCapture
)(Main);

//  Window
const MainWithDataWithWindowSize = windowSize(MainWithData);

// Export
export default MainWithDataWithWindowSize;
