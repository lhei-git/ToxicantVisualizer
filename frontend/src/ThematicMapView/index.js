import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";
import LoadingSpinner from "../LoadingSpinner";
import Filters from "../Filters";
import vetapi from "../api/vetapi";
import "./index.css";
import Title from "../Title/index.js";
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
      latestYear: 2019,
      contentState: "",
      contentCounty: "",
      stateData: null,
      countyData: null,
      filters: null,
    };

    this.handleContentState = this.handleContentState.bind(this);
    this.handleContentCounty = this.handleContentCounty.bind(this);
  }

  //loads state and county data when component loads
  componentDidMount() {
    this.getStateData();
    this.getCountyData();
  }

  //refetch data if the year or release type filter changed
  componentDidUpdate(prevProps) {
    if (prevProps.filters !== this.props.filters) {
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

  //convert releaseType filter to display text
  getReleaseTypeString(releaseType) {
    return (
      (releaseType !== "all" ? releaseType.replace("_", " ") : "")
        .charAt(0)
        .toUpperCase() +
      (releaseType !== "all" ? releaseType.replace("_", " ") : "").slice(1)
    );
  }

  //convert applied filters into parenthetical text
  getParentheticalString(filters) {
    var strings = [];

    if (filters.chemical !== "all") strings.push(filters.chemical);
    if (filters.pbt === true) strings.push("PBTs");
    if (filters.carcinogen === true) strings.push("Carcinogens");

    if (strings.length === 0) return "";
    if (strings.length === 1) return " (" + strings[0] + " Only)";
    if (strings.length === 2)
      return " (" + strings[0] + " & " + strings[1] + " Only)";
    if (strings.length === 3)
      return (
        " (" + strings[0] + ", " + strings[1] + " & " + strings[2] + " Only)"
      );
  }

  render() {
    const filterYear =
      this.props.filters.year !== null
        ? this.props.filters.year
        : this.state.latestYear;
    const filterType =
      this.props.filters.releaseType !== null
        ? this.props.filters.releaseType
        : "all";

    return (
      <div className="thematic-view-wrapper">
        <div className="filter-container">
          <Filters
            map={this.props.map}
            filters={this.props.filters}
            onFilterChange={this.props.onFilterChange}
          ></Filters>
        </div>
        <div className="thematic-view-container">
          <div className="flex-item">
            <div className="graph-header">
              {Title("by state", this.props, true)}
            </div>
            {this.state.stateData ? (
              <>
                <ThematicMap
                  setTooltipContent={this.handleContentState}
                  data={this.state.stateData}
                  filterYear={filterYear}
                  filterType={filterType === "all" ? "total" : filterType}
                  geoUrl={stateGeoUrl}
                  mapType={"states"}
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
              {Title("by county", this.props, true)}
            </div>
            {this.state.countyData ? (
              <>
                <ThematicMap
                  setTooltipContent={this.handleContentCounty}
                  data={this.state.countyData}
                  filterYear={filterYear}
                  filterType={filterType === "all" ? "total" : filterType}
                  geoUrl={countyGeoUrl}
                  mapType={"counties"}
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
    //possible filters
    const filterYear = this.props.filters.year;
    const pbt = this.props.filters.pbt;
    const carcinogen = this.props.filters.carcinogen;
    const chemical = this.props.filters.chemical;

    const params = {
      year: filterYear,
      pbt,
      carcinogen,
      chemical,
    };

    //apply filters and run GET request
    vetapi
      .get("/stats/county/all", { params })
      .then((response) => {
        this.setState({ countyData: response.data });
      })
      .catch((err) => console.log(err));
  }

  // retrieves and filters state release data from the database
  getStateData() {
    //possible filters
    const filterYear = this.props.filters.year;
    const pbt = this.props.filters.pbt;
    const carcinogen = this.props.filters.carcinogen;
    const chemical = this.props.filters.chemical;

    const params = {
      year: filterYear,
      pbt,
      carcinogen,
      chemical,
    };
    //apply filters and run GET request
    vetapi
      .get("/stats/state/all", { params })

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
