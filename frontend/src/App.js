/* eslint-disable import/first */

require("dotenv").config();
const React = require("react");
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import history from "./history";
import Home from "./Home";
import MapContainer from "./MapContainer";
import "./App.css";
import "./index.css";

const App = () => {
  const [location, setLocation] = React.useState(
    localStorage.getItem("searchedLocation") || ""
  );

  function handleSearchChange(text) {
    setLocation(text);
  }

  React.useEffect(() => {
    localStorage.setItem("searchedLocation", location);
  }, [location]);

  function handleSearchSubmit() {
    history.push("/map");
  }

  return (
    <Router history={history}>
      <div className="app-container">
        <nav className="navbar">
          <div>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/map">Map</Link>
              </li>
              <li>
                <Link to="/graphs">Graphs</Link>
              </li>
            </ul>
          </div>
          {location !== "" && window.location.pathname === "/map" && (
            <div className="query">
              Search: <span>{location}</span>
            </div>
          )}
        </nav>

        {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/map">
            <div className="title">
              Visualizer of Environmental Toxicants (VET)
            </div>
            <div className="map-view">
              <div className="filter-wrapper">
                <div className="filters">
                  
                </div>
              </div>
              <div className="map-wrapper">
                <MapContainer apiKey={process.env.REACT_APP_GOOGLE_API_KEY} />
              </div>
            </div>
          </Route>
          <Route path="/graphs">
            <div>graphs go here</div>
          </Route>
          <Route path="/">
            <Home
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />
          </Route>
        </Switch>
        <div className="footer">
          © VET was developed in 2020 for the Lab for Health and Environmental
          Information
        </div>
      </div>
    </Router>
  );
};

export default App;
