import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";
import LoadingSpinner from "../LoadingSpinner";
import UserControlPanel from "../Filters";
import vetapi from "../api/vetapi";
import "./index.css";
const React = require("react");
const Component = React.Component;

// state and county map topographical data, used to create svg map
const stateGeoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers.json";
const countyGeoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers-counties.json";

class ThematicMapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentState: "",
      contentCounty: "",
      stateData: null,
      countyData: null,
      filterYear: null,
      prevYear: null,
      filterType: null, //valid options: total, air, water, land, on_site, off_site
      prevType: null,
    };

    this.handleContentState = this.handleContentState.bind(this);
    this.handleContentCounty = this.handleContentCounty.bind(this);
  }

  componentDidMount() {
    this.getStateData();
    this.getCountyData();
  }

  getFilterText(type) {
    return (type === "total" ? "" : type) + " ";
  }

  //refetch data if the year or release type filter changed
  componentDidUpdate(prevProps) {
    if (
      prevProps.filters.year !== this.props.filters.year ||
      prevProps.filters.releaseType !== this.props.filters.releaseType
    ) {
      this.setState(
        {
          stateData: null,
          countyData: null,
        },
        () => {
          this.getStateData();
          this.getCountyData();
        }
      );
    }
  }

  //sets tooltip content for the maps
  handleContentState(content) {
    this.setState({ contentState: content });
  }

  //sets tooltip content for the maps
  handleContentCounty(content) {
    this.setState({ contentCounty: content });
  }

  getReleaseTypeString(releaseType) {
    return releaseType !== "all" ? releaseType.replace("_", " ") : "";
  }

  render() {
    const filterYear =
      this.props.filters.year !== null ? this.props.filters.year : 2019;
    const filterType =
      this.props.filters.releaseType !== null
        ? this.props.filters.releaseType
        : "all";

    return (
      <div class="thematic-view-wrapper">
        <div className="filter-container">
          <UserControlPanel
            map={this.props.map}
            filters={this.props.filters}
            onFilterChange={this.props.onFilterChange}
          ></UserControlPanel>
        </div>
        <div className="thematic-view-container">
          <div className="flex-item">
            <div className="graph-header">
              Total{" "}
              {this.getReleaseTypeString(this.props.filters.releaseType) + " "}
              Releases By State
            </div>
            {this.state.stateData ? (
              <>
                <ThematicMap
                  setTooltipContent={this.handleContentState}
                  data={this.state.stateData}
                  maxValue={this.state.stateMax}
                  minValue={this.state.stateMin}
                  filterYear={filterYear}
                  filterType={filterType === "all" ? "total" : filterType}
                  geoUrl={stateGeoUrl}
                  type={"states"}
                />
                <ReactTooltip multiline={true} html={true}>
                  {this.state.contentState}
                </ReactTooltip>
              </>
            ) : (
              <LoadSpinner />
            )}
          </div>

          <div className="flex-item">
            <div className="graph-header">
              Total{" "}
              {this.getReleaseTypeString(this.props.filters.releaseType) + " "}
              Releases By County
            </div>
            {this.state.countyData ? (
              <>
                <ThematicMap
                  setTooltipContent={this.handleContentCounty}
                  data={this.state.countyData}
                  maxValue={this.state.countyMax}
                  minValue={this.state.countyMin}
                  filterYear={filterYear}
                  filterType={filterType === "all" ? "total" : filterType}
                  geoUrl={countyGeoUrl}
                  type={"counties"}
                />
                <ReactTooltip multiline={true} html={true}>
                  {this.state.contentCounty}
                </ReactTooltip>
              </>
            ) : (
              <LoadSpinner />
            )}
          </div>
        </div>
      </div>
    );
  }

  // retrieves and filters county release data from the database
  async getCountyData() {
    console.trace("fetching data");
    const filterYear = this.props.filters.year;
    vetapi
      .get("/stats/county/all?year=" + filterYear)
      .then((response) => {
        this.setState({ countyData: response.data });
      })
      .catch((err) => console.log(err));
  }

  // retrieves and filters state release data from the database
  getStateData() {
    const filterYear = this.props.filters.year;
    vetapi
      .get("/stats/state/all?year=" + filterYear)
      .then((response) => {
        this.setState({ stateData: response.data });
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

export default ThematicMapView;
