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
import { getChemical } from "./helpers";
const React = require("react");

const initialState = {
  location: localStorage.getItem("searchedLocation") || "",
  numFacilities: 0,
  refreshed: false,
  lastSearch: "",
  chemicals: [],
  filters: {
    dioxins: false,
    carcinogens: false,
    releaseType: "all",
    year: 2018,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setLocation":
      return { ...state, location: action.payload };
    case "setNumFacilities":
      return { ...state, numFacilities: action.payload };
    case "setFilters":
      return { ...state, filters: action.payload };
    case "setChemicals":
      return {
        ...state,
        chemicals: action.payload.map((c) => ({
          ...c,
          name: getChemical(c.name),
        })),
      };
    case "setLastSearch":
      localStorage.setItem("searchedLocation", state.location);
      return { ...state, lastSearch: action.payload };
    case "refresh":
      const old = state.refreshed;
      return { ...state, refreshed: !old, chemicals: [] };
    default:
      throw new Error();
  }
};

const setLocation = (location) => ({ type: "setLocation", payload: location });
const setNumFacilities = (num) => ({ type: "setNumFacilities", payload: num });
const setFilters = (filters) => ({ type: "setFilters", payload: filters });
const refresh = () => ({ type: "refresh" });
const setLastSearch = (search) => ({ type: "setLastSearch", payload: search });
const setChemicals = (chemicals) => ({
  type: "setChemicals",
  payload: chemicals,
});

const App = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  function handleSearchSubmit() {
    dispatch(setLastSearch(state.location));
    // localStorage.setItem("searchedLocation", state.location);
    history.push("/map");
  }

  function renderChemicals(chemicals) {
    if (chemicals.length === 0) return <div></div>;

    const listItems = chemicals
      .sort((a, b) => b.totalreleases - a.totalreleases)
      .map((c) => (
        <li key={c.name + " " + c.totalreleases}>
          {c.name} ({c.totalreleases} lbs)
        </li>
      ));
    return (
      <div>
        <ol>{listItems}</ol>
      </div>
    );
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
          {state.lastSearch !== "" && (
            <div className="query">
              Search: <span>{state.lastSearch}</span>
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
                    numFacilities={state.numFacilities}
                    onFilterChange={(filters) => dispatch(setFilters(filters))}
                    onRefresh={() => dispatch(refresh())}
                  ></UserControlPanel>
                </div>
                <div className="chemicals">
                  {renderChemicals(state.chemicals)}
                </div>
              </div>

              <div className="map-wrapper">
                <MapContainer
                  filters={Object.assign({}, state.filters)}
                  apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                  onUpdate={(num) => dispatch(setNumFacilities(num))}
                  refreshed={state.refreshed}
                  onMarkerClick={(chemicals) =>
                    dispatch(setChemicals(chemicals))
                  }
                />
              </div>
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
