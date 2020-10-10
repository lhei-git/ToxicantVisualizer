/* eslint-disable import/first */

require("dotenv").config();
const React = require("react");
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
  withRouter,
} from "react-router-dom";
import history from "./history";
import Home from "./Home";
import MapContainer from "./MapContainer";
const axios = require("./api/axios/index");
const geocoder = require("./api/geocoder/index");
import "./App.css";
import "./index.css";

const App = () => {
  const [searchValue, setSearchValue] = React.useState(
    localStorage.getItem("searchedLocation") || ""
  );

  function handleSearchChange(text) {
    setSearchValue(text);
  }

  React.useEffect(() => {
    localStorage.setItem("searchedLocation", searchValue);
  }, [searchValue]);

  function handleSearchSubmit() {
    history.push("/map");
  }

  return (
    <Router history={history}>
      <div>
        <nav className="navbar">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/map">Map</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/map">
            <MapContainer apiKey={process.env.REACT_APP_GOOGLE_API_KEY} />
          </Route>
          <Route path="/">
            <Home
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
