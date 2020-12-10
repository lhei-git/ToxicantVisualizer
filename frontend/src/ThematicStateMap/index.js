import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";
import LoadingSpinner from "../LoadingSpinner";
import vetapi from "../api/vetapi";
import "./index.css";
import data from "../data/stateLocationData.json";
import Title from "../Title/index.js";
const React = require("react");
const Component = React.Component;
const { shallowEqual } = require("../helpers");

class ThematicStateMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latestYear: 2019,
      contentCounty: "",
      geoUrl: "",
      stateName: "",
      prevStateName: "",
      countyData: null,
      filters: null,
      scale: null,
      lat: null,
      lon: null,
    };

    this.handleContentCountyState = this.handleContentCountyState.bind(this);
  }

  //retrieves county data when component loads
  componentDidMount() {
    this.getCountyData();
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

    if (filters.chemical != "all") strings.push(filters.chemical);
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

  // refetches data if the year or release type filter changed
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.filters !== this.props.filters) {
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
      this.props.filters.year !== null
        ? this.props.filters.year
        : this.state.latestYear;
    const filterType =
      this.props.filters.releaseType === "all"
        ? "total"
        : this.props.filters.releaseType;

    return (
      <div className="thematic-view-container">
        <div className="flex-item">
          <div className="graph-header">
            <Title
              text="by county"
              filters={this.props.filters}
              map={this.props.map}
            ></Title>
          </div>
          {this.state.countyData ? (
            <>
              <ThematicMap
                setTooltipContent={this.handleContentCountyState}
                data={this.state.countyData}
                filterYear={this.props.filters.year}
                filterType={filterType}
                geoUrl={this.state.geoUrl}
                mapType={"singleState"}
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
    //possible filters
    const filterYear = this.props.filters.year;
    const pbt = this.props.filters.pbt;
    const carcinogen = this.props.filters.carcinogen;
    const chemical = this.props.filters.chemical;
    const stateName = this.props.stateName;

    const params = {
      year: filterYear,
      pbt,
      carcinogen,
      chemical,
      state: stateName,
    };

    //apply filters and run GET request
    vetapi
      .get("/stats/county/all", { params })
      .then((response) => {
        this.setState({ countyData: response.data });
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
