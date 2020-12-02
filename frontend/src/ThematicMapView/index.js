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
      stateMax: null,
      stateMin: null,
      countyData: null,
      countyMax: null,
      countyMin: null,
      filterYear: null,
      prevYear: null,
      filterType: null, //valid options: on_site, air, water, land, off_site, total
      prevType: null,
      countyMap: null,
      stateMap: null,
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
    //valid options: total, air, water, land, off_site, off_site
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
    this.setState({ content: content });
  }

  //sets tooltip content for the maps
  handleContentCounty(content) {
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
    var l = {};
    var d = [];
    var maxValue = 0;
    var minValue = Number.MAX_SAFE_INTEGER;
    const filterYear = this.state.filterYear;
    const filterType = this.state.filterType;
    await vetapi
      .get("/stats/county/all?year=" + filterYear)
      .then((response) => {
        l = response.data;
        d = Object.values(l);
        response.data.forEach((st) => {
          if (st[filterType] > maxValue) {
            maxValue = st[filterType];
          } else if (st[filterType] < minValue) minValue = st[filterType];
        });
        this.setState({
          countyData: d,
          countyMin: minValue,
          countyMax: maxValue,
        });
      });
  }

  // retrieves and filters state release data from the database
  getStateData() {
    var l = {};
    var d = [];
    var maxValue = 0;
    var minValue = Number.MAX_SAFE_INTEGER;
    const filterYear = this.state.filterYear;
    const filterType = this.state.filterType;
    vetapi
      .get("/stats/state/all?year=" + filterYear)
      .then((response) => {
        l = response.data;
        d = Object.values(l);
        response.data.forEach((st, i) => {
          if (st[filterType] > maxValue) maxValue = st[filterType];
          if (st[filterType] < minValue && st[filterType] !== 0)
            minValue = st[filterType];
        });

        this.setState({ stateData: d, stateMin: minValue, stateMax: maxValue });
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
