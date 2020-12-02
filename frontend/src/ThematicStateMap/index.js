import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";
import LoadingSpinner from "../LoadingSpinner";
import vetapi from "../api/vetapi";
import "./index.css";
import data from "../data/stateLocationData.json";
const React = require("react");
const Component = React.Component;

class ThematicStateMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentCounty: "",
      geoUrl: "",
      stateName: "MI",
      prevStateName: "",
      countyData: null,
      filterYear: null,
      prevYear: null,
      filterType: "total", //valid options: total, air, water, land, off_site, on_site  DEFAULT: total
      prevType: null,
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
        return "All Releases";
      default:
        return "All On Site Releases";
    }
  }

  // refetches data if the year or release type filter changed
  componentDidUpdate() {
    this.state.filterYear = this.props.year;
    if (this.props.stateName) this.state.stateName = this.props.stateName;
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
          this.getCountyData();
        }
      );
    }
    //sets scaling and positioning for the map projection
    if (this.state.prevStateName !== this.state.stateName) {
      this.setState({ prevStateName: this.state.stateName });
      data.forEach((e) => {
        if (e.state == this.state.stateName)
          this.setState({
            lat: e.latitude,
            lon: e.longitude,
            scale: e.scale,
            geoUrl: e.geoUrl,
            stateLongName: e.name,
          });
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
      this.state.filterType !== null ? this.state.filterType : "total";

    return (
      <div className="thematic-view-container">
        <div className="flex-item">
          <div className="graph-header">
            {this.props.stateLongName} Total Releases By County (
            {this.getFilterText(this.state.filterType)})
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
    await vetapi
      .get("/stats/county/all?year=" + filterYear + "&state=" + this.state.stateName)
      .then((response) => {
        this.setState({
          countyData: response.data
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
