import * as React from "react";

import { SearchQuery } from "../__generated__/types";
import { Search as QUERY } from "../queries";
import { graphql, QueryProps } from "react-apollo";

import { RouteComponentProps } from "react-router";
import NavigationBar from "../components/navigation-bar";
import ListItem from "../components/list-item";

import ReactECharts from "echarts-for-react";

import { ChevronRight, ChevronLeft } from "react-feather";

import config from "../cfg";

const COUNT = 20; // number of results to return

interface Node {
  id: string;
  name: string;
  category: string;
}

interface Params {
  query: string;
}

interface Data extends QueryProps<SearchQuery>, SearchQuery {}

export interface Props extends RouteComponentProps<Params> {
  data: Data;
}

export interface SurfaceResultsState {
  value: string;
  startResultIndex: number;
  totalResults: number;
}

class SurfaceResults extends React.Component<Props, SurfaceResultsState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: this.props.match.params.query,
      startResultIndex: 0,
      totalResults: 0
    };

    this.handleSurface = this.handleSurface.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handlePageDown = this.handlePageDown.bind(this);
    this.handlePageUp = this.handlePageUp.bind(this);

    this.getNodeData = this.getNodeData.bind(this);

    this.renderPageDown = this.renderPageDown.bind(this);
    this.renderPageUp = this.renderPageUp.bind(this);
    this.renderResults = this.renderResults.bind(this);
    this.renderNetwork = this.renderNetwork.bind(this);
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.data.search) {
      if (this.props.data.search.pageInfo) {
        this.setState({
          totalResults: this.props.data.search.pageInfo.total
        });
      }
    }
  }

  handleChange(e: React.FormEvent<HTMLInputElement>): void {
    this.setState({
      value: e.currentTarget.value
    });
  }

  handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      this.handleSurface();
    }
  }

  handleSurface() {
    this.props.history.push(`/surface/${this.state.value}`);
  }

  handlePageDown() {
    const startResultIndex = this.state.startResultIndex;

    if (startResultIndex === 0) {
      return;
    }

    this.setState({
      startResultIndex: startResultIndex - COUNT
    });
  }

  handlePageUp() {
    const startResultIndex = this.state.startResultIndex;

    if (this.state.totalResults < this.state.startResultIndex + COUNT) {
      return;
    }

    this.setState({
      startResultIndex: startResultIndex + COUNT
    });
  }

  getNodeData() {
    const focusResults = this.props.data.search.results;
    let focusResultsNodes: Array<Node> = focusResults.map(capture => {
      let node: Node = {
        id: capture.id,
        name: capture.body,
        category: "focusResult"
      };
      return node;
    });

    // let blurResults = [];
    let blurResultsNodes: Array<Node> = [];
    if (this.props.data.search.pageInfo) {
      for (
        let i = focusResults.length;
        i < this.props.data.search.pageInfo.total - 1;
        i++
      ) {
        let node: Node = {
          id: i.toString(),
          name: "TODO",
          category: "blurResult"
        };
        blurResultsNodes = blurResultsNodes.concat(node);
      }
    }

    return focusResultsNodes.concat(blurResultsNodes);
  }

  renderPageDown() {
    let isActive = this.state.startResultIndex > 0;

    return (
      <div
        className={`f6 dtc v-mid ${isActive ? "gray pointer" : "light-gray"}`}
        onClick={this.handlePageDown}
      >
        <ChevronLeft />
      </div>
    );
  }

  renderPageUp() {
    let isActive =
      this.state.totalResults > this.state.startResultIndex + COUNT;

    return (
      <div
        className={`f6 dtc v-mid ${isActive ? "gray pointer" : "light-gray"}`}
        onClick={this.handlePageUp}
      >
        <ChevronRight />
      </div>
    );
  }

  renderResults() {
    return this.props.data.search.results.map(capture => {
      return (
        <ListItem
          body={capture.body}
          onClick={() => {
            return;
          }}
          accentColor={config.surfaceAccentColor}
          key={capture.id}
        />
      );
    });
  }

  renderNetwork() {
    return (
      <ReactECharts
        style={{ height: "100%", width: "100%" }}
        option={{
          title: {
            text: ""
          },
          legend: {
            x: "center",
            show: false
          },
          toolbox: {
            show: false
          },
          tooltip: {
            show: true,
            showContent: true,
            backgroundColor: "#EEEEEE",
            extraCssText: "box-shadow: 0px 0px 4px 2px rgba( 0, 0, 0, 0.2 );",
            textStyle: {
              color: "#000"
            }
          },
          series: [
            {
              type: "graph",
              layout: "force",
              animation: true,
              animationDuration: 4000,
              animationEasingUpdate: "quinticInOut",
              symbolSize: 32,
              focusNodeAdjacency: true,
              label: {
                normal: {
                  show: false,
                  position: "right",
                  formatter: "{b}"
                },
                emphasis: {
                  show: false
                }
              },
              draggable: false,
              roam: false,
              data: this.getNodeData(),
              categories: [
                {
                  name: "focusResult",
                  itemStyle: {
                    normal: {
                      color: "#4592FF"
                    }
                  }
                },
                {
                  name: "blurResult",
                  itemStyle: {
                    normal: {
                      color: "#CCCCCC"
                    }
                  }
                }
              ],
              force: {
                initLayout: "circular",
                edgeLength: 5,
                repulsion: 100,
                gravity: 0.2
              },
              edges: [], // [{ source: 1, target: 2 }],
              lineStyle: {
                normal: {
                  opacity: 0.9,
                  width: 1,
                  curveness: 0
                }
              }
            }
          ]
        }}
      />
    );
  }

  render() {
    return (
      <div className={`w-100 vh-100 flex-column`}>
        {/* Navigation Bar */}
        <div className={`db`}>
          <NavigationBar />
        </div>

        <div className={`flex flex-grow`}>
          {/* Sidebar */}
          <div className={`flex-column flex-grow  measure shadow-1`}>
            {/* Search Header */}
            <div
              className={`flex-column drawer h4 measure bg-${
                config.surfaceBaseColor
              }`}
            >
              {/* Search Bar */}
              <div
                className={`center w-90 ma3 pa3 h2 bg-white dt br1 b--light-gray shadow-1`}
              >
                <div className={`w-100 dtc v-mid tc`}>
                  <input
                    className={`f6 w-80`}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onKeyPress={this.handleKeyPress}
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div
              className={`flex-column flex-grow measure bg-light-gray overflow-auto`}
            >
              {this.props.data.loading === false &&
              this.props.data.error === undefined
                ? this.renderResults()
                : null}
            </div>

            {/* Pagination Footer */}
            <div
              className={`flex-column drawer h3 measure bg-white bt b--light-gray`}
            >
              <div className={`w-100`}>
                <div className={`fr pa3 dt`}>
                  <div className={`tr f6 gray dtc v-mid`}>
                    {`Showing results ${this.state.startResultIndex +
                      1} - ${this.state.startResultIndex + COUNT}`}
                  </div>
                  {this.renderPageDown()}
                  {this.renderPageUp()}
                </div>
              </div>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className={`flex-column flex-grow`}>
            {this.props.data.loading === false &&
            this.props.data.error === undefined
              ? this.renderNetwork()
              : null}
          </div>
        </div>
      </div>
    );
  }
}

const SurfaceResultsWithData = graphql(QUERY, {
  options: (ownProps: Props) => ({
    variables: {
      query: ownProps.match.params.query,
      count: COUNT
    }
  })
})(SurfaceResults);

export default SurfaceResultsWithData;
