/* eslint-disable import/first */

require('dotenv').config();
const React = require('react');
import MapContainer from './maps/MapContainer'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <MapContainer apiKey={process.env.REACT_APP_GOOGLE_API_KEY}></MapContainer>
      </div>
    );
  }
}

export default App;