/* eslint-disable import/first */

require("dotenv").config();
const React = require("react");
const Component = React.Component;
const { Map, Marker, LatLng, GoogleApiWrapper } = require("google-maps-react");
const mapStyles = require("./styles");
import "./MapContainer.css";

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
      bounds: {
        northeast: null,
        southwest: null,
      },
    };
  }

  // componentDidUpdate() {
  //   let newBounds = this.props.bounds;
  //   this.setState({
  //     bounds: newBounds,
  //   });
  // }

  render() {
    // create a marker for every point that is passed to the map
    const markers = this.props.points.map((point, i) => {
      return <Marker name={"point " + i} key={"point-" + i} position={point} />;
    });

    return (
      <div className="map">
        <Map
          onReady={this.props.onReady}
          onIdle={this.props.onIdle}
          google={this.props.google}
          zoom={14}
          streetViewControl={false}
          styles={mapStyles}
          initialCenter={initialCenter}
          center={this.props.searchedCenter}
          containerStyle={containerStyle}
        >
          {markers}
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper((props) => ({
  apiKey: props.apiKey,
}))(MapContainer);
