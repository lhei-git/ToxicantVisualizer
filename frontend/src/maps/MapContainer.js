/* eslint-disable import/first */

require('dotenv').config();
const React = require('react');
const Component = React.Component;
const { Map, Marker, GoogleApiWrapper } = require('google-maps-react');
const mapStyles = require('./styles');

/* Detroit, MI */
const initialCenter = {
  lat: 42.3314,
  lng: -83.0458
}

// Wrapping class around Google Maps react object
class MapContainer extends Component {

  render() {
    // create a marker for every point that is passed to the map
    const markers = this.props.points.map((point, i) => {
      return (
        <Marker name={"point " + i} key={"point-"+i} position={point} />
      )
    })

    return (
      <Map className="map"
        onReady={this.props.onReady}
        onIdle={this.props.onIdle}
        google={this.props.google}
        zoom={14}
        streetViewControl={false}
        styles={mapStyles}
        initialCenter={initialCenter}
      >
        {markers}
      </Map>
    );
  }
}

export default GoogleApiWrapper(
  (props) => ({
    apiKey: props.apiKey
  }
  ))(MapContainer);