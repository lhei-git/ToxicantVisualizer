/* eslint-disable import/first */

require('dotenv').config();
const React = require('react');
const axios = require('./axios/index');
import MapContainer from './maps/MapContainer';
import './App.css';

class App extends React.Component {
  componentDidMount(){
    axios.get('/_healthz')
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
  }

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