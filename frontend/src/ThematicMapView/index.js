import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";
// import Loader from 'react-loader-spinner';
import LoadingSpinner from "../LoadingSpinner";
import vetapi from "../api/vetapi";
import "./index.css";
const React = require("react");
const Component = React.Component;

// state and county map topographical data
const stateGeoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers.json";
const countyGeoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers-counties.json";
//const countyGeoUrl = "https://raw.githubusercontent.com/jgoodall/us-maps/master/topojson/county.topo.json"

class ThematicMapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      stateData: null,
      stateMax: null,
      stateMin: null,
      countyData: null,
      countyMax: null,
      countyMin: null,
      filterYear: null,
      prevYear: null,
      filterType: null, //valid options: totalonsite, air, water, land, totaloffsite, total
      prevType: null,
      countyMap: null,
      stateMap: null,
    };

    this.handleContent = this.handleContent.bind(this);
    this.state.filterYear = 2018;
    this.state.filterYear = 2018;
    this.state.filterType = "totalonsite";
    this.state.filterType = "totalonsite";
  }

  //call this function to apply new filters to the thematic maps
  //valid types: totalonsite, air, water, land, totaloffsite, total
  //valid years: 6 - 2018
  constApplyFilter(props) {
    if (!props.year) this.setState({ filterYear: props.year });
    if (!props.type) this.setState({ filterType: props.type });
  }

  componentDidMount() {
    this.getStateData();
    this.getCountyData();
  }

  //refetch data if the year or release type filter changed
  componentDidUpdate() {
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
  handleContent(content) {
    this.setState({ content: content });
  }

  render() {
    const filterYear =
      this.state.filterYear !== null ? this.state.filterYear : 2018;
    const filterType =
      this.state.filterType !== null ? this.state.filterType : "totalonsite";

    return (
      <div className="thematic-view-container">
        <div className="flex-item">
          <h1>Total Releases By State (all types)</h1>
          {this.state.stateData ? (
            <>
              <ThematicMap
                setTooltipContent={this.handleContent}
                data={this.state.stateData}
                maxValue={this.state.stateMax}
                minValue={this.state.stateMin}
                filterYear={filterYear}
                filterType={filterType}
                geoUrl={stateGeoUrl}
                type={"states"}
              />
            </>
          ) : (
            <LoadSpinner />
          )}
        </div>

        <div className="flex-item">
          <h1>Total Releases By County (all types)</h1>
          {this.state.countyData ? (
            <>
              <ThematicMap
                setTooltipContent={this.handleContent}
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

  getCountyData() {
    var l = {};
    var d = [];
    var maxValue = 0;
    var minValue = 100000000000000;
    const filterYear = this.state.filterYear;
    const filterType = this.state.filterType;
    vetapi
      .get("/stats/county/all?year=" + filterYear)
      .then((response) => {
        l = response.data;
        d = Object.values(l);
        response.data.map((st, i) => {
          if (response.data[i][filterType] > maxValue)
            maxValue = response.data[i][filterType];
          if (
            response.data[i][filterType] < minValue &&
            response.data[i][filterType] !== 0
          )
            minValue = response.data[i][filterType];
        });
        this.setState({
          countyData: d,
          countyMin: minValue,
          countyMax: maxValue,
        });
      })
      .catch((err) => console.log(err));
  }

  getStateData() {
    var l = {};
    var d = [];
    var maxValue = 0;
    var minValue = 100000000000000;
    const filterYear = this.state.filterYear;
    const filterType = this.state.filterType;
    vetapi
      .get("/stats/state/all?year=" + filterYear)
      .then((response) => {
        l = response.data;
        d = Object.values(l);
        response.data.forEach((st, i) => {
          if (response.data[i][filterType] > maxValue)
            maxValue = response.data[i][filterType];
          if (
            response.data[i][filterType] < minValue &&
            response.data[i][filterType] !== 0
          )
            minValue = response.data[i][filterType];
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
      {/* <Loader type="ThreeDots" color="#2BAD60" height="100" width="100" /> */}
      <LoadingSpinner></LoadingSpinner>
    </div>
  );
}

export default ThematicMapView;
