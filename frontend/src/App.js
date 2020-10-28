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
import ThematicMapView from "./ThematicMapView/index.js";
import { useReducer } from "react";
import { formatChemical } from "./helpers";
const geocoder = require("./api/geocoder");
const React = require("react");

const INITIAL_CENTER = {
  lat: 39.8283,
  lng: -98.5795,
};

const initialState = {
  location: localStorage.getItem("searchedLocation") || "",
  numFacilities: 0,
  lastSearch: "",
  center: INITIAL_CENTER,
  viewport: null,
  showPubchemInfo: false,
  chemicals: [],
  selectedChemicalList: [],
  currentChemical: "",
  filters: {
    chemical: "all",
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
        selectedChemicalList: action.payload,
      };
    case "setCurrentChemical":
      return { ...state, currentChemical: action.payload };
    case "setMapView":
      return {
        ...state,
        center: action.payload.center,
        viewport: action.payload.viewport,
      };
    case "setMarker":
      return {
        ...state,
        showPubchemInfo: false,
        chemicals: action.payload.map((c) => ({
          ...c,
          name: formatChemical(c.name),
        })),
      };
    case "setLastSearch":
      localStorage.setItem("searchedLocation", state.location);
      return { ...state, lastSearch: action.payload };
    case "showPubchemInfo":
      return { ...state, showPubchemInfo: !state.showPubchemInfo };
    case "refresh":
      return {
        ...state,
        chemicals: [],
        showPubchemInfo: false,
      };
    default:
      throw new Error();
  }
};

const setLocation = (payload) => ({ type: "setLocation", payload });
const setNumFacilities = (payload) => ({ type: "setNumFacilities", payload });
const setFilters = (payload) => ({ type: "setFilters", payload });
const refresh = () => ({ type: "refresh" });
const setLastSearch = (payload) => ({ type: "setLastSearch", payload });
const setMapView = (payload) => ({ type: "setMapView", payload });
const showPubchemInfo = () => ({ type: "showPubchemInfo" });
const setChemicals = (payload) => ({ type: "setChemicals", payload });
const setCurrentChemical = (payload) => ({
  type: "setCurrentChemical",
  payload,
});
const setMarker = (payload) => ({
  type: "setMarker",
  payload,
});

function ChemicalList(props) {
  const { chemicals } = props;
  if (chemicals.length === 0) return <div></div>;

  const listItems = chemicals
    .sort((a, b) => b.vet_total_releases - a.vet_total_releases)
    .map((c) => (
      <li
        onClick={() => {
          props.onClick(c.name);
        }}
        key={c.name + " " + c.vet_total_releases}
      >
        {c.name} ({c.vet_total_releases} lbs)
      </li>
    ));
  return (
    <div>
      <ol>{listItems}</ol>
    </div>
  );
}

const Footer = () => {
  const React = require("react");
  return (
    <div className="footer">
      &#169;{" "}
      <span>
        VET was developed in 2018 for the Lab for Health and Environmental
        Information
      </span>
    </div>
  );
};

const App = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // fetches data when component is updated
  React.useEffect(() => {
    if (state.viewport === null) geocodeLocation(state.location);
  });

  function handleSearchSubmit() {
    geocodeLocation(state.location)
      .then(() => {
        dispatch(setLastSearch(state.location));
        history.push("/map");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function geocodeLocation(location) {
    const res = await geocoder.get(`/json?address=${location}`);
    dispatch(
      setMapView({
        center: res.data.results[0].geometry.location,
        viewport: res.data.results[0].geometry.viewport,
      })
    );
  }

  return (
    <Router history={history}>
      <div className="app-container">
        {/* <nav className="navbar">
          <div>
            <ul>
              <li>
                <Link to="/">HOME</Link>
              </li>

              <li>
                <Link to="/map">MAP</Link>
              </li>
              <li>
                <Link to="/graphs">GRAPHS</Link>
              </li>
            </ul>
          </div>
        </nav> */}
        <Switch>
          <Route path="/map">
            <div className="search"></div>
            <div className="title">
              <div className="go-home">
                <Link to="/"> &lt; Back to home</Link>
              </div>
              Visualizer of Environmental Toxicants (VET)
            </div>
            <div className="map-view">
              <div className="filter-wrapper">
                <div className="filters">
                  <UserControlPanel
                    chemicals={state.selectedChemicalList}
                    filters={Object.assign({}, state.filters)}
                    numFacilities={state.numFacilities}
                    onFilterChange={(filters) => dispatch(setFilters(filters))}
                  ></UserControlPanel>
                </div>
                {state.showPubchemInfo ? (
                  <div className="pubchem">
                    <div
                      className="back"
                      onClick={() => {
                        dispatch(showPubchemInfo());
                      }}
                    >
                      &lt; Back to Chemicals
                    </div>
                    <PubChemFields chemName={state.currentChemical} />
                  </div>
                ) : (
                  <div className="chemicals">
                    {state.chemicals.length === 0 ? (
                      <div className="placeholder">
                        <div className="text-center">
                          Click a facility on the map to see its pollutants.{" "}
                        </div>
                      </div>
                    ) : (
                      <div className="header">
                        Released Toxicants (click for info)
                      </div>
                    )}
                    <ChemicalList
                      onClick={(chemical) => {
                        dispatch(showPubchemInfo());
                        dispatch(setCurrentChemical(chemical));
                      }}
                      chemicals={state.chemicals}
                    ></ChemicalList>
                  </div>
                )}
              </div>
              <div className="map-wrapper">
                {state.viewport && (
                  <MapContainer
                    filters={Object.assign({}, state.filters)}
                    center={state.center}
                    viewport={state.viewport}
                    apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                    onUpdate={(num) => dispatch(setNumFacilities(num))}
                    onFetchPoints={(chemicals) => {
                      dispatch(setChemicals(chemicals));
                    }}
                    onRefresh={() => dispatch(refresh())}
                    onMarkerClick={(chemicals) =>
                      dispatch(setMarker(chemicals))
                    }
                  />
                )}
              </div>
            </div>
            <GraphView
              viewport={state.viewport}
              year={state.filters.year}
            ></GraphView>
            {/* <Footer /> */}
          </Route>
          <Route path="/thematicmaps">
            <div className="thematic-Maps">
              <ThematicMapView year={state.filters.year}></ThematicMapView>
            </div>
          </Route>
          <Route path="/">
            <Home
              onSearchChange={(search) => dispatch(setLocation(search))}
              onSearchSubmit={handleSearchSubmit}
            />
            <Footer />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default withRouter(App);
