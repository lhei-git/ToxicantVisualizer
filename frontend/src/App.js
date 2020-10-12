/* eslint-disable import/first */
require("dotenv").config();
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import history from "./history";
import Home from "./Home";
import MapContainer from "./MapContainer";
import GraphView from "./GraphView";
import PubChemFields from "./PubChemFields";
import "./App.css";
import "./index.css";
import UserControlPanel from "./UserControlPanel";
const React = require("react");

const App = () => {
  const [location, setLocation] = React.useState(
    localStorage.getItem("searchedLocation") || ""
  );
  const [chemical, setChemical] = React.useState("");
  const [totalReleases, setTotalReleases] = React.useState(0);
  const [filters, setFilters] = React.useState({
    open: true,
    dioxins: false,
    carcinogens: false,
    otherChems: false,
    releaseType: "any",
  });

  function onChemTypeChange(filters) {
    setFilters(filters);
  }

  function handleSearchChange(text) {
    setLocation(text);
  }

  function handleSearchSubmit() {
    history.push("/map");
  }

  function onMapUpdate(num){
    setTotalReleases(num);
  }
  
  React.useEffect(() => {
    localStorage.setItem("searchedLocation", location);
  }, [location]);

  React.useEffect(() => {
    console.log(totalReleases);
  }, [totalReleases]);

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
                  <UserControlPanel
                    filters={filters}
                    totalReleases={totalReleases}
                    onChemTypeChange={onChemTypeChange}
                  ></UserControlPanel>
                  <PubChemFields chemName={chemical}></PubChemFields>
                </div>
              </div>
              <div className="map-wrapper">
                <MapContainer
                  filters={filters}
                  setChemical={setChemical}
                  onUpdate={onMapUpdate}
                  apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                />
              </div>
            </div>
          </Route>
          <Route path="/graphs">
            <GraphView></GraphView>
          </Route>
          <Route path="/">
            <Home
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />
          </Route>
        </Switch>
        {/* <div className="footer">
          © VET was developed in 2020 for the Lab for Health and Environmental
          Information
        </div> */}
      </div>
    </Router>
  );
};

export default App;
