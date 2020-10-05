/* eslint-disable import/first */
require("dotenv").config();
import "./index.css";
// import mapStyles from "./darkmode";
const React = require("react");
const Component = React.Component;
const {
  Map,
  Marker,
  InfoWindow,
  GoogleApiWrapper,
} = require("google-maps-react");

/* Detroit, MI */
const INITIAL_CENTER = {
  lat: 42.3314,
  lng: -83.0458,
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
      showingInfoWindow: false,
      center: INITIAL_CENTER,
      bounds: {
        northeast: null,
        southwest: null,
      },
    };

    this.onZoomChanged = this.onZoomChanged.bind(this);
  }

  componentDidMount() {
    this.setState({
      center: INITIAL_CENTER,
    });
  }

  onMarkerClick = (props, marker) => {
    this.props.onMarkerClick(marker);
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true,
      zoom: 14,
      center: {
        lat: marker.position.lat(),
        lng: marker.position.lng(),
      },
    });
  };

  onMapClick = (mapProps, map) => {
    this.props.viewportUpdated(mapProps, map);
    console.log(this.state.showingInfoWindow);
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
      });
    }
  };

  onZoomChanged(mapProps, map) {
    this.setState({
      zoom: map.zoom,
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

  render() {
    // create a marker for every point that is passed to the map
    const markers = this.props.points.map((point, i) => {
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
      <div className="map">
        <Map
          onReady={this.props.onReady}
          onClick={this.onMapClick}
          onZoomChanged={this.onZoomChanged}
          onDragend={this.props.viewportUpdated}
          google={this.props.google}
          zoom={this.state.zoom}
          streetViewControl={false}
          styles={[]}
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
    );
  }
}

export default GoogleApiWrapper((props) => ({
  apiKey: props.apiKey,
}))(MapContainer);
