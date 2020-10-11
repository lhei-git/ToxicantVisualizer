/* eslint-disable import/first */

require("dotenv").config();
const React = require("react");
const axios = require("./api/axios/index");
const geocoder = require("./api/geocoder/index");
import MapContainer from "./MapContainer";
import SearchBar from "./SearchBar";
import PubChemFields from "./PubChemFields";
import "./App.css";
import "./index.css";

class App extends React.Component {
  constructor(props) {
    super(props);

    // high-level app state held here
    this.state = {
      activeMarker: null,
      points: [],
      bounds: {
        northeast: null,
        southwest: null,
      },
      searchedCenter: {
        lat: null,
        lng: null,
      },
      zipCode: null,
      zoom: 14,
      mapFilters: {},
      filters: []
    };

    // binding required when sending callbacks to child components
    this.fetchPoints = this.fetchPoints.bind(this);
    this.viewportUpdated = this.viewportUpdated.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onFilter = this.onFilter.bind(this);
  }

  // get all data points within current map bounds
  fetchPoints() {
    if (this.state.bounds.northeast === null) return;

    const vm = this;
    vm.setState({
      points: [],
    });
    const ne = this.state.bounds.northeast;
    const sw = this.state.bounds.southwest;
    axios
      .get(
        `/points?ne_lat=${ne.lat()}&ne_lng=${ne.lng()}&sw_lat=${sw.lat()}&sw_lng=${sw.lng()}`
      )
      .then((res) => {
        vm.setState({
          // flat map allows you to skip null and false values
          points: res.data.flatMap((d) => this.filterPoints(d) ? d.fields : [])
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //filters points out of map data based on filter criteria
  filterPoints(d)
  {
    //temporary array of conditions to filter by
    var returnVal = true;

    this.state.filters.map((value, index) =>{
            if(d.fields[Object.keys(value)[0]] !== Object.values(value)[0])
                returnVal = false;
                }
    )

    return returnVal;
  }

  // run methods when component is first fully rendered
  componentDidMount() {
    this.fetchPoints(null);
  }

  onSearch(address) {
    if (address === null || address === "") return;
    geocoder
      .get(`/json?address=${address}`)
      .then((res) => {
        if (res.status === 200)
          this.setState({
            searchedCenter: res.data.results[0].geometry.location,
            zoom: this.state.zoom,
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // update map markers when map bounds change
  viewportUpdated(mapProps, map) {
    const bounds = map.getBounds();
    this.setState({
      bounds: {
        northeast: bounds.getNorthEast(),
        southwest: bounds.getSouthWest(),
      },
    });
    this.fetchPoints();
  }

  // update map markers when filters change
  onFilter(filters)
  {
    this.setState({filters:filters})
    this.fetchPoints();
  }

  onMarkerClick(marker) {
    this.setState({
      activeMarker: marker,
    });
  }

  refreshPage() {
    window.location.reload(false);
  }

  render() {
    return (
      <div className="app">
        <div className="banner">
          <div className="navigation">
            <ul>
              <li>MAPS</li>
              <li>GRAPHS</li>
              <li>ABOUT</li>
            </ul>
          </div>
          <div className="logo" onClick={this.refreshPage}>
            VET
          </div>
        </div>
        <div className="container">
          <div className="side one">
            <SearchBar onSearch={this.onSearch}
                       onFilter={this.onFilter}></SearchBar>
            <div className="pubchem">
              {this.state.activeMarker !== null && (
                <PubChemFields
                  chemName={this.state.activeMarker.meta.chemical}
                ></PubChemFields>
              )}
            </div>
          </div>
          <div className="side two">
            <MapContainer
              zoom={this.state.zoom}
              onIdle={this.viewportUpdated}
              points={this.state.points}
              apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
              searchedCenter={this.state.searchedCenter}
              onMarkerClick={this.onMarkerClick}
            ></MapContainer>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
