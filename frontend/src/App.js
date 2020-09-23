/* eslint-disable import/first */

require('dotenv').config();
const React = require('react');
const axios = require('./axios/index');
import MapContainer from './maps/MapContainer';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      points: []
    }
  }

  componentDidMount(){
    axios.get('/search')
      .then((res) => {
        this.setState({
          points: res.data
        })
      })
      .catch((err) => {
        console.log(err);
      })
  }

  render() {
    return (
      <div className="App">
        <div className="map">
          <MapContainer points={this.state.points} apiKey={process.env.REACT_APP_GOOGLE_API_KEY}></MapContainer>
        </div>
      </div>
    );
  }
}

export default App;