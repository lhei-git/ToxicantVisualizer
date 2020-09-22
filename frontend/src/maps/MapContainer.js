/* eslint-disable import/first */

require('dotenv').config();
const React = require('react');
const Component = React.Component;
const { Map, Marker, GoogleApiWrapper } = require('google-maps-react');
const mapStyles = require('./styles');

class MapContainer extends Component {
  render() {
    return (
      <Map className="map"
        google={this.props.google}
        zoom={14}
        styles={mapStyles}
        /* Detroit, MI */
        initialCenter={
          {
            lat: 42.3314,
            lng: -83.0458
          }
        }
      >
        <Marker
          title={'The marker`s title will appear as a tooltip.'}
          name={'SOMA'}
          position={{ lat: 42.3314, lng: -83.0458 }} />
      </Map>
    );
  }
}

export default GoogleApiWrapper(
  (props) => ({
    apiKey: props.apiKey
  }
  ))(MapContainer);