import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";
// import Loader from 'react-loader-spinner';
import LoadingSpinner from "../LoadingSpinner";
import vetapi from "../api/vetapi";
import "./index.css";
import data from '../data/stateLocationData.json'
const React = require("react");
const Component = React.Component;

class ThematicStateMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentState: "",
      contentCounty: "",
      geoUrl: "",
      stateName: "",
      prevStateName: "",
      countyData: null,
      countyMax: null,
      countyMin: null,
      filterYear: null,
      prevYear: null,
      filterType: null, //valid options: totalonsite, air, water, land, totaloffsite, total
      prevType: null,
      countyMap: null,
      stateMap: null,
      scale: null,
      lat: null,
      lon: null,
    };

    this.handleContentState = this.handleContentState.bind(this);
    this.handleContentCounty = this.handleContentCounty.bind(this);
    this.state.filterYear = props.year;
    //this.state.filterYear = props.year;
    this.state.filterType = "totalonsite";
    this.state.stateName = props.stateName;
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
    this.getCountyData();
  }

  getFilterText(filterType)
  {
  //valid types: totalonsite, air, water, land, totaloffsite, total
      switch(filterType) {
      case "totalonsite":
        return "All On Site Releases"
      case "air":
        return "All Air Releases"
      case "water":
        return "All Water Releases"
      case "land":
        return "All Land Releases"
      case "totaloffsite":
        return "All Off Site Releases"
      case "total":
        return "All Releases"
      default:
        return "All On Site Releases"
    }
  }

  fixFilterName( type )
  {
    switch(type) {
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
        return "total"
}
  }

  //refetch data if the year or release type filter changed
  componentDidUpdate() {
    // update filters from parent
    this.state.filterYear = this.props.year;
    this.state.stateName = this.props.stateName;
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
          this.getCountyData();
        }
      );
    }
    if(this.state.prevStateName !== this.state.stateName )
    {
    this.setState({ prevStateName: this.state.stateName})
    data.forEach(e => {
        if (e.state == this.state.stateName)
            this.setState({ lat: e.latitude,
                           lon: e.longitude,
                            scale: e.scale,
                            geoUrl: e.geoUrl})
    })}
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
    const filterState =
      this.props.state;

    return (
      <div className="thematic-view-container">
        <div className="flex-item">
          <h1>{this.props.stateLongName} Total Releases By County ({this.getFilterText(this.state.filterType)})</h1>
          {this.state.countyData ? (
            <>
              <ThematicMap
                setTooltipContent={this.handleContentCounty}
                data={this.state.countyData}
                maxValue={this.state.countyMax}
                minValue={this.state.countyMin}
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

  async getCountyData() {
    var l = {};
    var d = [];
    var maxValue = 0;
    var minValue = Number.MAX_SAFE_INTEGER ;
    const filterYear = this.state.filterYear;
    const filterType = this.state.filterType;
    await vetapi
      .get("/stats/county/all?year=" + filterYear)
      .then((response) => {
        l = response.data;
        d = Object.values(l);
        response.data.map((st, i) => {
          if (response.data[i].[filterType] > maxValue && response.data[i].state === this.state.stateName)
            maxValue = response.data[i].[filterType];
          if (response.data[i].[filterType] < minValue && response.data[i].state === this.state.stateName)
            minValue = response.data[i].[filterType];
        });
        this.setState({
          countyData: d,
          countyMin: minValue,
          countyMax: maxValue,
        });
      });
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

export default ThematicStateMap;
