/* eslint-disable import/first */

require('dotenv').config();
const React = require('react');
const axios = require('./axios/index');
import MapContainer from './maps/MapContainer';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    // high-level app state held here
    this.state = {
      points: [],
      bounds: {
        northeast: null,
        southwest: null,
      },
    }

    // binding required when sending callbacks to child components
    this.fetchPoints = this.fetchPoints.bind(this);
    this.viewportUpdated = this.viewportUpdated.bind(this);
  }

  // get all data points within current map bounds
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

  // run methods when component is first fully rendered
  componentDidMount() {
    this.fetchPoints();
  }

  // update map markers when map bounds change
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