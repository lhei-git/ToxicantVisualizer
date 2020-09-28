/* eslint-disable import/first */
require("dotenv").config();
import "./index.css";
import mapStyles from "./styles";
const React = require("react");
const Component = React.Component;
const {
  Map,
  Marker,
  InfoWindow,
  GoogleApiWrapper,
} = require("google-maps-react");

/* Detroit, MI */
const initialCenter = {
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
      activeMarker: {
        chemical: null,
      },
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
    const markers = this.props.points.map((point, i) => {
      return (
        <Marker
          name={"point " + i}
          key={"point-" + i}
          position={{ lat: point.latitude, lng: point.longitude }}
          chemical={this.chemicalToTitle(point.chemical)}
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
          styles={mapStyles}
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
              <div>{this.state.activeMarker.chemical}</div>
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
