import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";
import LoadingSpinner from "../LoadingSpinner";
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
    this.state.filterYear = props.year;
    this.state.filterType = props.type;
  }

  componentDidMount() {
    this.getStateData();
    this.getCountyData();
  }

  getFilterText(filterType) {
    //valid options: total, air, water, land, on_site, off_site
    switch (filterType) {
      case "on_site":
        return "All On Site Releases";
      case "air":
        return "All Air Releases";
      case "water":
        return "All Water Releases";
      case "land":
        return "All Land Releases";
      case "off_site":
        return "All Off Site Releases";
      case "total":
      default:
        return "All Releases";
    }
  }

  //refetch data if the year or release type filter changed
  componentDidUpdate() {
    this.state.filterYear = this.props.year;
    this.state.filterType =
      this.props.type === "all" ? "total" : this.props.type;
    if (
      this.state.prevYear !== this.state.filterYear ||
      this.state.prevType !== this.state.filterType
    ) {
      this.setState(
        {
          prevYear: this.state.filterYear,
          prevType: this.state.filterType,
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

  render() {
    const filterYear =
      this.state.filterYear !== null ? this.state.filterYear : 2019;
    const filterType =
      this.state.filterType !== null ? this.state.filterType : "total";

    return (
      <div className="thematic-view-container">
        <div className="flex-item">
          <div className="graph-header">
            Total Releases By State ({this.getFilterText(this.state.filterType)}
            )
          </div>
          {this.state.stateData ? (
            <>
              <ThematicMap
                setTooltipContent={this.handleContentState}
                data={this.state.stateData}
                maxValue={this.state.stateMax}
                minValue={this.state.stateMin}
                filterYear={filterYear}
                filterType={filterType}
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
            Total Releases By County (
            {this.getFilterText(this.state.filterType)})
          </div>
          {this.state.countyData ? (
            <>
              <ThematicMap
                setTooltipContent={this.handleContentCounty}
                data={this.state.countyData}
                maxValue={this.state.countyMax}
                minValue={this.state.countyMin}
                filterYear={filterYear}
                filterType={filterType}
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
    );
  }

  // retrieves and filters county release data from the database
  async getCountyData() {
    const filterYear = this.state.filterYear;
    vetapi
      .get("/stats/county/all?year=" + filterYear)
      .then((response) => {
        this.setState({   countyData: response.data  });
      }).catch((err) => console.log(err));
  }

  // retrieves and filters state release data from the database
  getStateData() {
    const filterYear = this.state.filterYear;
    vetapi
      .get("/stats/state/all?year=" + filterYear)
      .then((response) => {
        this.setState({ stateData: response.data});
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
