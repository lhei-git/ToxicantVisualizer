import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";
import LoadingSpinner from "../LoadingSpinner";
import vetapi from "../api/vetapi";
import "./index.css";
import data from "../data/stateLocationData.json";
const React = require("react");
const Component = React.Component;
const { shallowEqual } = require("../helpers");

class ThematicStateMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentCounty: "",
      geoUrl: "",
      stateName: "",
      prevStateName: "",
      countyData: null,
      filterYear: null,
      releaseType: "total", //valid options: total, air, water, land, off_site, on_site  DEFAULT: total
      scale: null,
      lat: null,
      lon: null,
    };

    this.handleContentCountyState = this.handleContentCountyState.bind(this);

    if (props.year) this.state.filterYear = props.year;
    if (props.type) this.state.filterType = props.type;
  }

  componentDidMount() {
    this.getCountyData();
  }

  getFilterText(type) {
    //valid options: all, air, water, land, on_site, off_site
    return type !== "all" ? type.replace("_", " ") : "";
  }

  // refetches data if the year or release type filter changed
  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.year !== prevProps.year ||
      this.props.stateName !== prevProps.stateName ||
      this.props.type !== prevProps.type
    ) {
      this.getCountyData();

      this.setState(
        {
          stateData: null,
          countyData: null,
        },
        () => {
          this.getCountyData();
        }
      );
    }

    //sets scaling and positioning for the map projection
    if (this.state.prevStateName !== this.props.stateName) {
      this.setState({ prevStateName: this.props.stateName });
      const found = data.find((e) => e.state === this.props.stateName);

      this.setState({
        lat: found.latitude,
        lon: found.longitude,
        scale: found.scale,
        geoUrl: found.geoUrl,
        stateLongName: found.name,
      });
    }
  }

  // sets tooltip content for the map
  handleContentCountyState(content) {
    this.setState({ content: content });
  }

  render() {
    const filterYear =
      this.state.filterYear !== null ? this.state.filterYear : 2019;
    const filterType =
      this.props.releaseType === "all" ? "total" : this.props.releaseType;

    return (
      <div className="thematic-view-container">
        <div className="flex-item">
          <div className="graph-header">
            Total {this.getFilterText(this.props.releaseType)} releases By
            County for {this.props.stateLongName} in {this.props.year}
          </div>
          {this.state.countyData ? (
            <>
              <ThematicMap
                setTooltipContent={this.handleContentCountyState}
                data={this.state.countyData}
                filterYear={filterYear}
                filterType={filterType}
                geoUrl={this.state.geoUrl}
                type={"singleState"}
                stateName={this.props.stateName}
                lat={this.state.lat}
                lon={this.state.lon}
                scale={this.state.scale}
              />
              <ReactTooltip multiline={true} html={true}>
                {this.state.content}
              </ReactTooltip>
            </>
          ) : (
            <LoadSpinner />
          )}
        </div>
      </div>
    );
  }

  // retrieves and filters county release data from the database
  async getCountyData() {
    const filterYear = this.state.filterYear;
    const filterType = this.state.filterType;
    const params = {
      year: filterYear,
      state: this.props.stateName,
    };
    await vetapi
      .get("/stats/county/all", { params })
      .then((response) => {
        this.setState({
          countyData: response.data,
        });
      })
      .catch((err) => console.log(err));
  }
}

// loading animation
function LoadSpinner() {
  return (
    <div
      style={{
        width: "100%",
        height: "100",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LoadingSpinner></LoadingSpinner>
    </div>
  );
}

export default ThematicStateMap;
