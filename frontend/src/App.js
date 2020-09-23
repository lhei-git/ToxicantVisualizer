/* eslint-disable import/first */

require('dotenv').config();
const React = require('react');
import MapContainer from './maps/MapContainer'
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="map">
          <MapContainer apiKey={process.env.REACT_APP_GOOGLE_API_KEY}></MapContainer>
        </div>
      </div>
    );
  }
}

export default App;