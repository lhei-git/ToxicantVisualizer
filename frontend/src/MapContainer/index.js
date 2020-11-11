import "./index.css";
import "../index.css";
import mapStyles from "./standard";
import MarkerCluster from "./MarkerClusterer";
import LoadingSpinner from "../LoadingSpinner";
const React = require("react");
const vetapi = require("../api/vetapi/index");
const { shallowEqual } = require("../helpers");
const Component = React.Component;
const { Map, InfoWindow, GoogleApiWrapper } = require("google-maps-react");

const containerStyle = {
  position: "relative",
  overflow: "hidden",
  height: "100%",
  width: "100%",
};

// Wrapping class around Google Maps react object
class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeMarker: null,
      markers: [],
      points: [],
      showingInfoWindow: false,
      isLoading: true,
      map: null,
      chemicalList: [],
      hasMoved: false,
    };

    this.fetchPoints = this.fetchPoints.bind(this);
    this.handleMount = this.handleMount.bind(this);
    this.adjustMap = this.adjustMap.bind(this);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.createMarkers = this.createMarkers.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  onRefresh() {
    const newState = {};
    const oldPoints = this.state.points;
    newState.markers = this.createMarkers(oldPoints);

    const mapsApi = this.props.google.maps;
    const viewport = this.props.viewport;
    if (viewport) {
      try {
        const b = this.createLatLngBounds(viewport, mapsApi);
        this.map.fitBounds(b);
      } catch (err) {
        console.log(err);
      }
    }
    newState.showingInfoWindow = false;
    newState.hasMoved = false;
    this.setState(newState, () => {
      this.props.onRefresh();
    });
  }

  componentDidUpdate(prevProps) {
    const newState = {};
    const refiltered = !shallowEqual(prevProps.filters, this.props.filters);
    if (refiltered) {
      this.setState({ isLoading: true }, () => {
        this.fetchPoints(this.props.viewport, this.props.filters);
      });
      // if (this.props.filters.year !== prevProps.filters.year) {
      //   this.setState({ isLoading: true }, () => {
      //     this.fetchPoints(
      //       this.props.viewport,
      //       this.props.filters
      //     );
      //   });
      // } else {
      //   const oldPoints = this.state.points;
      //   newState.markers = this.createMarkers(oldPoints);
      // }
      newState.showingInfoWindow = false;
      this.setState(newState);
    }

    const mapsApi = this.props.google.maps;
    if (!shallowEqual(prevProps.viewport, this.props.viewport)) {
      try {
        const b = this.createLatLngBounds(this.props.viewport, mapsApi);
        this.map.fitBounds(b);
      } catch (err) {
        console.log(err);
      }
    }
  }

  onMarkerClick(props) {
    const showing = this.state.showingInfoWindow;
    if (!showing || !shallowEqual(this.state.activeMarker, props.entry)) {
      this.setState(
        {
          activeMarker: props.entry,
          showingInfoWindow: true,
          hasMoved: true,
        },
        () => {
          this.map.setCenter(props.marker.position);
          this.map.setZoom(14);
          this.props.onMarkerClick(props.entry.meta.id);
        }
      );
    } else {
      this.setState({
        showingInfoWindow: false,
      });
    }
  }

  uniq(a) {
    var seen = {};
    return a.filter(function (item) {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
  }

  fetchPoints(viewport, filters) {
    console.log("fetching...");
    const params = {
      ne_lat: viewport.northeast.lat,
      ne_lng: viewport.northeast.lng,
      sw_lat: viewport.southwest.lat,
      sw_lng: viewport.southwest.lng,
      carcinogen: filters.carcinogens || null,
      dioxin: filters.dioxins || null,
      pbt: filters.pbts || null,
      release_type: filters.releaseType,
      year: filters.year,
    };
    vetapi
      .get(`/facilities`, { params })
      .then((res) => {
        const data = res.data;
        this.setState({
          points: data,
          markers: this.createMarkers(data),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleMount(mapProps, map) {
    this.map = map;
    const mapsApi = this.props.google.maps;
    setTimeout(() => {
      mapsApi.event.addListener(map, "center_changed", () => {
        this.setState({ hasMoved: true });
      });
    }, 1000);

    // const viewport = this.props.viewport;
    this.adjustMap(mapProps, map);
  }

  adjustMap(mapProps, map) {
    const mapsApi = this.props.google.maps;
    const viewport = this.props.viewport;
    if (viewport) {
      try {
        const b = this.createLatLngBounds(viewport, mapsApi);
        map.fitBounds(b);
        mapsApi.event.addListenerOnce(map, "idle", () => {
          this.setState(
            {
              isLoading: true,
            },
            () => {
              this.fetchPoints(viewport, this.props.filters);
            }
          );
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  createLatLngBounds(viewport, api) {
    const n = new api.LatLng(viewport.northeast.lat, viewport.northeast.lng);
    const s = new api.LatLng(viewport.southwest.lat, viewport.southwest.lng);
    return new api.LatLngBounds(s, n);
  }

  getColor(total) {
    let color = 1;
    if (total < 100) color = 1;
    else if (total < 100) color = 2;
    else if (total < 10000) color = 3;
    else if (total < 100000) color = 4;
    else if (total < 1000000) color = 5;
    else color = 6;
    return color;
  }

  createMarkers(points) {
    console.log("creating markers");
    const facilities = points;
    // create a marker for every point that is passed to the map
    const markers = facilities.map((facility, i) => {
      return {
        meta: facility,
        color: this.getColor(facility.total),
        name: facility.name,
        position: {
          lat: parseFloat(facility.latitude),
          lng: parseFloat(facility.longitude),
        },
      };
    });
    this.setState(
      {
        isLoading: false,
      },
      () => {
        this.props.onUpdate(markers.length);
      }
    );
    return markers;
  }

  render() {
    return (
      <div className={`map-container ${this.state.isLoading ? "loading" : ""}`}>
        {this.state.isLoading && (
          <div className="loading-overlay">
            <div className="spinner">
              <LoadingSpinner></LoadingSpinner>
            </div>
          </div>
        )}
        {this.state.hasMoved && (
          <div className="refresh" onClick={this.onRefresh}>
            RESET
          </div>
        )}
        <div className="map">
          <Map
            onReady={this.handleMount}
            onTilesloaded={this.props.onTilesLoaded}
            google={this.props.google}
            streetViewControl={false}
            styles={mapStyles}
            draggable={true}
            fullscreenControl={false}
            zoom={5}
            minZoom={5}
            initialCenter={this.props.center}
            containerStyle={containerStyle}
          >
            {this.state.markers.length > 0 && (
              <MarkerCluster
                releaseType={this.props.filters.releaseType}
                markers={this.state.markers}
                click={this.onMarkerClick}
                mouseover={this.onMouseOver}
                mouseout={this.onMouseOut}
                minimumClusterSize={15}
              />
            )}
            <InfoWindow
              marker={this.state.activeMarker}
              visible={this.state.showingInfoWindow}
            >
              <div className="info-window">
                {this.state.activeMarker !== null && (
                  <div>
                    <h2>{this.state.activeMarker.name}</h2>
                    <p>
                      {this.state.activeMarker.meta.street_address} <br></br>
                      {this.state.activeMarker.meta.city},{" "}
                      {this.state.activeMarker.meta.state}{" "}
                      {this.state.activeMarker.meta.zip}
                    </p>
                    <p>
                      Industry: {this.state.activeMarker.meta.industry_sector}
                    </p>
                    <p>
                      Total Toxicants Released:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {this.state.activeMarker.meta.total.toLocaleString()}{" "}
                        lbs
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </InfoWindow>
          </Map>
          )
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper((props) => ({
  apiKey: props.apiKey,
}))(MapContainer);
