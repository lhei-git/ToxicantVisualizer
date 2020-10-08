/* eslint-disable import/first */
require("dotenv").config();
import "./index.css";
import mapStyles from "./darkmode";
const React = require("react");
const Component = React.Component;
const {
  Map,
  Marker,
  InfoWindow,
  GoogleApiWrapper,
} = require("google-maps-react");

/* Los Angeles */
const initialCenter = {
  lat: 34.0522,
  lng: -118.2437,
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
      bounds: {
        northeast: null,
        southwest: null,
      },
    };
  }

  onMarkerClick = (props, marker) => {
    this.props.onMarkerClick(marker);
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true,
    });
  };

  onMapClicked = () => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
      });
    }
  };

  chemicalToTitle(chem) {
    return chem.charAt(0) + chem.slice(1).toLowerCase();
  }

  render() {
    // create a marker for every point that is passed to the map

    /* TODO this function removes multiple-chemical release values. Remove once backend combines chemicals for the same location */

    const points = this.props.points.filter((e, i, arr) => {
      if (
        i > 0 &&
        e.latitude === arr[i - 1].latitude &&
        e.longitude === arr[i - 1].longitude
      )
        return false;
      return true;
    });
    const markers = points.map((point, i) => {
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
          onClicked={this.onMapClicked}
          onIdle={this.props.onIdle}
          google={this.props.google}
          zoom={this.props.zoom || 14}
          streetViewControl={false}
          styles={[]}
          initialCenter={initialCenter}
          center={this.props.searchedCenter}
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
