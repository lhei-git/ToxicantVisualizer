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
      filterType: null, //valid options: totalonsite, air, water, land, totaloffsite, total
      prevType: null,
      countyMap: null,
      stateMap: null,
    };

    this.handleContentState = this.handleContentState.bind(this);
    this.handleContentCounty = this.handleContentCounty.bind(this);
    this.state.filterYear = props.year;
    //this.state.filterYear = props.year;
    this.state.filterType = "totalonsite";
    //this.state.filterType = "totalonsite";
  }

  //call this function to apply new filters to the thematic maps
  //valid types: totalonsite, air, water, land, totaloffsite, total
  //valid years: 6 - 2019
  constApplyFilter(props) {
    if (props.year) this.setState({ filterYear: props.year });
    if (props.type) this.setState({ filterType: props.type });
  }

  componentDidMount() {
    this.getStateData();
    this.getCountyData();
  }

  getFilterText(filterType) {
    //valid types: totalonsite, air, water, land, totaloffsite, total
    switch (filterType) {
      case "totalonsite":
        return "All On Site Releases";
      case "air":
        return "All Air Releases";
      case "water":
        return "All Water Releases";
      case "land":
        return "All Land Releases";
      case "totaloffsite":
        return "All Off Site Releases";
      case "total":
        return "All Releases";
      default:
        return "All On Site Releases";
    }
  }

  fixFilterName(type) {
    switch (type) {
      case "all":
        return "total";
      case "air":
      case "water":
      case "land":
        return type;
      case "off_site":
        return "totaloffsite";
      case "on_site":
        return "totalonsite";
      default:
        return "total";
    }
  }

  //refetch data if the year or release type filter changed
  componentDidUpdate() {
    // update filters from parent
    this.state.filterYear = this.props.year;
    this.state.filterType = this.fixFilterName(this.props.type);
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
      this.state.filterYear !== null ? this.state.filterYear : 2018;
    const filterType =
      this.state.filterType !== null ? this.state.filterType : "totalonsite";

    return (
      <div className="thematic-view-container">
        <div className="flex-item">
          <h1>
            Total Releases By State ({this.getFilterText(this.state.filterType)}
            )
          </h1>
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
          <h1>
            Total Releases By State ({this.getFilterText(this.state.filterType)}
            )
          </h1>
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

  getCountyData() {
    var l = {};
    var d = [];
    var maxValue = 0;
    var minValue = Number.MAX_SAFE_INTEGER;
    const filterYear = this.state.filterYear;
    const filterType = this.state.filterType;
<<<<<<< HEAD
    await vetapi
=======
    vetapi
>>>>>>> 98952a65ba3a171c42dd5abbd18c3cdf8e906dd1
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
<<<<<<< HEAD
      });

    alert(maxValue);
=======
      })
      .catch((err) => console.log(err));
>>>>>>> 98952a65ba3a171c42dd5abbd18c3cdf8e906dd1
  }

  getStateData() {
    var l = {};
    var d = [];
    var maxValue = 0;
    var minValue = Number.MAX_SAFE_INTEGER;
    const filterYear = this.state.filterYear;
    const filterType = this.state.filterType;
<<<<<<< HEAD
    await vetapi.get("/stats/state/all?year=" + filterYear).then((response) => {
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
    });
=======
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
>>>>>>> 98952a65ba3a171c42dd5abbd18c3cdf8e906dd1
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
