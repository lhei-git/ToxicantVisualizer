/* eslint-disable import/first */
import "./index.css";
import mapStyles from "./standard";
const React = require("react");
const geocoder = require("../api/geocoder/index");
const axios = require("../api/axios/index");
const Component = React.Component;
const {
  Map,
  Marker,
  InfoWindow,
  GoogleApiWrapper,
} = require("google-maps-react");

const INITIAL_CENTER = {
  lat: 39.8283,
  lng: -98.5795,
};

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
      points: [],
      showingInfoWindow: false,
      center: INITIAL_CENTER,
      isLoading: true,
      viewport: null,
      map: null,
    };

    this.fetchPoints = this.fetchPoints.bind(this);
    this.handleMount = this.handleMount.bind(this);
    this.adjustMap = this.adjustMap.bind(this);
    this.onMarkerClick = this.onMarkerClick.bind(this);
  }

  onMarkerClick(props, marker) {
    this.setState({
      activeMarker: marker,
      showingInfoWindow: true,
    });

    this.map.setCenter(marker.position);
    this.map.setZoom(14);
  }

  geocodeLocation(location) {
    return new Promise((resolve, reject) => {
      geocoder
        .get(`/json?address=${location}`)
        .then((res) => {
          this.setState({
            isLoading: false,
            center: res.data.results[0].geometry.location,
            viewport: res.data.results[0].geometry.viewport,
          });
        })
        .then(resolve)
        .catch(reject);
    });
  }

  fetchPoints(map) {
    const ne = map.getBounds().getNorthEast();
    const sw = map.getBounds().getSouthWest();
    axios
      .get(
        `/points?ne_lat=${ne.lat()}&ne_lng=${ne.lng()}&sw_lat=${sw.lat()}&sw_lng=${sw.lng()}`
      )
      .then((res) => {
        this.setState({
          points: res.data.map((d) => d.fields),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  chemicalToTitle(chem) {
    return chem.charAt(0) + chem.slice(1).toLowerCase();
  }

  getCenter() {
    let state = this.state;
    if (state.activeMarker) {
      return {
        lat: this.state.activeMarker.position.lat(),
        lng: this.state.activeMarker.position.lng(),
      };
    } else {
      return this.props.searchedCenter || INITIAL_CENTER;
    }
  }

  handleMount(mapProps, map) {
    this.map = map;
    const location = localStorage.getItem("searchedLocation") || "";
    if (location !== "")
      this.geocodeLocation(location).then(() => {
        this.adjustMap(mapProps, map);
      });
  }

  adjustMap(mapProps, map) {
    const mapsApi = this.props.google.maps;
    const viewport = this.state.viewport;
    if (viewport) {
      try {
        const n = new mapsApi.LatLng(
          viewport.northeast.lat,
          viewport.northeast.lng
        );
        const s = new mapsApi.LatLng(
          viewport.southwest.lat,
          viewport.southwest.lng
        );
        const b = new mapsApi.LatLngBounds(s, n);
        map.fitBounds(b);
        mapsApi.event.addListenerOnce(map, "idle", () => this.fetchPoints(map));
      } catch (err) {
        console.log(err);
      }
    }
  }

  render() {
    // create a marker for every point that is passed to the map
    const markers = this.state.points.map((point, i) => {
      return (
        <Marker
          name={"point " + i}
          key={"point-" + i}
          position={{ lat: point.latitude, lng: point.longitude }}
          meta={point}
          onClick={this.onMarkerClick}
        />
      );
    });

    return (
      <div className="map-container">
        <div className="map">
          <Map
            onReady={this.handleMount}
            google={this.props.google}
            streetViewControl={false}
            styles={mapStyles}
            draggable={false}
            zoom={5}
            center={this.state.center}
            initialCenter={INITIAL_CENTER}
            containerStyle={containerStyle}
          >
            {markers}
            <InfoWindow
              marker={this.state.activeMarker}
              visible={this.state.showingInfoWindow}
            >
              <div>
                {this.state.activeMarker !== null && (
                  <div>{this.state.activeMarker.meta.facilityname}</div>
                )}
              </div>
            </InfoWindow>
          </Map>
        </div>
        )
      </div>
    );
  }
}

export default GoogleApiWrapper((props) => ({
  apiKey: props.apiKey,
}))(MapContainer);
