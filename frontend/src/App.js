/* eslint-disable import/first */
require("dotenv").config();
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  withRouter,
} from "react-router-dom";
import history from "./history";
import Home from "./Home";
import MapContainer from "./MapContainer";
import GraphView from "./GraphView";
import PubChemFields from "./PubChemFields";
import "./App.css";
import "./index.css";
import UserControlPanel from "./UserControlPanel";
import { useReducer } from "react";
const React = require("react");

const initialState = {
  location: localStorage.getItem("searchedLocation") || "",
  numReleases: 0,
  refreshed: false,
  chemical: "",
  showingPubchem: false,
  chemicals: [],
  filters: {
    dioxins: false,
    carcinogens: false,
    releaseType: "any",
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setLocation":
      return { ...state, location: action.payload };
    case "setNumReleases":
      return { ...state, numReleases: action.payload };
    case "setFilters":
      return { ...state, filters: action.payload };
    case "togglePubchem":
      return { ...state, showingPubchem: action.payload };
    case "setChemicals":
      return { ...state, chemicals: action.payload };
    case "refresh":
      const old = state.refreshed;
      return { ...state, refreshed: !old };
    default:
      throw new Error();
  }
};

const setLocation = (location) => ({ type: "setLocation", payload: location });
const setNumReleases = (num) => ({ type: "setNumReleases", payload: num });
const setFilters = (filters) => ({ type: "setFilters", payload: filters });
const refresh = () => ({ type: "refresh" });
const setChemicals = (chemicals) => ({
  type: "setChemicals",
  payload: chemicals,
});
const togglePubchem = (value) => ({
  type: "togglePubchem",
  payload: value,
});

const App = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  function handleSearchSubmit() {
    localStorage.setItem("searchedLocation", state.location);
    history.push("/map");
  }

  function renderChemicals(chemicals) {
    if (chemicals.length === 0) return <div></div>;

    const listItems = chemicals.map((c) => <li key={c.name}>{c.name}</li>);
    return (
      <div>
        <ul>{listItems}</ul>
      </div>
    );
  }

  return (
    <Router history={history}>
      <div className="app-container">
        <nav className="navbar">
          <div>
            <ul>
              {props.location.pathname !== "/" && (
                <li>
                  <Link to="/">Home</Link>
                </li>
              )}
              {props.location.pathname !== "/" && (
                <li>
                  <Link to="/map">Map</Link>
                </li>
              )}
              <li>
                <Link to="/graphs">Graphs</Link>
              </li>
            </ul>
          </div>
          {state.location !== "" && props.location.pathname === "map" && (
            <div className="query">
              Search: <span>{state.location}</span>
            </div>
          )}
        </nav>
        <Switch>
          <Route path="/map">
            <div className="title">
              Visualizer of Environmental Toxicants (VET)
            </div>
            <div className="map-view">
              <div className="filter-wrapper">
                <div className="filters">
                  <UserControlPanel
                    filters={Object.assign({}, state.filters)}
                    numReleases={state.numReleases}
                    onFilterChange={(filters) => dispatch(setFilters(filters))}
                    onRefresh={() => dispatch(refresh())}
                  ></UserControlPanel>
                  {renderChemicals(state.chemicals)}
                </div>
              </div>
              {state.showingPubchem ? (
                <div></div>
              ) : (
                <div className="map-wrapper">
                  <MapContainer
                    filters={Object.assign({}, state.filters)}
                    apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                    onUpdate={(num) => dispatch(setNumReleases(num))}
                    refreshed={state.refreshed}
                    onMarkerClick={(chemicals) =>
                      dispatch(setChemicals(chemicals))
                    }
                  />
                </div>
              )}
            </div>
          </Route>
          <Route path="/graphs">
            <GraphView></GraphView>
          </Route>
          <Route path="/">
            <Home
              onSearchChange={(search) => dispatch(setLocation(search))}
              onSearchSubmit={handleSearchSubmit}
            />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default withRouter(App);
