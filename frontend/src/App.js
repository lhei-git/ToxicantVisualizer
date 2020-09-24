/* eslint-disable import/first */

require('dotenv').config();
const React = require('react');
const axios = require('./axios/index');
import MapContainer from './maps/MapContainer';
import Sidebar from './sidebar/Sidebar';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      points: [],
      bounds: {
        northeast: null,
        southwest: null,
      },
      zipCode: null,
    }

    this.fetchPoints = this.fetchPoints.bind(this);
    this.viewportUpdated = this.viewportUpdated.bind(this);
  }

  fetchPoints() {
    if(this.state.bounds.northeast === null) return;

    const vm = this;
    vm.setState({
      points: []
    })
    const ne = this.state.bounds.northeast;
    const sw = this.state.bounds.southwest;
    axios.get(`/search?northeast=${ne}&southwest=${sw}`)
      .then((res) => {
        vm.setState({
          points: res.data
        })
      })
      .catch((err) => {
        console.log(err);
      })
  }

  componentDidMount() {
    this.fetchPoints();
  }

  viewportUpdated(mapProps, map) {
    const bounds = map.getBounds();
    this.setState({
      bounds: {
        northeast: bounds.getNorthEast(),
        southwest: bounds.getSouthWest(),
      }
    });
    this.fetchPoints();
  }


  render() {
    return (
      <div className="App">
      <Sidebar
        onSearch={ () => {this.setState({zipCode: document.getElementById("searchField").value})}}>
      </Sidebar>
        <div className="map">
          <MapContainer
            onIdle={this.viewportUpdated}
            points={this.state.points}
            apiKey={process.env.REACT_APP_GOOGLE_API_KEY}>
          </MapContainer>
        </div>
      </div>
    );
  }
}

export default App;