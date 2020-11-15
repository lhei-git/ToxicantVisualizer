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
<<<<<<< HEAD
import ThematicStateMap from "./ThematicStateMap/index.js";
import { useReducer, useRef } from "react";
=======
import { useReducer } from "react";
>>>>>>> 98952a65ba3a171c42dd5abbd18c3cdf8e906dd1
import { formatChemical } from "./helpers";
import vetapi from "./api/vetapi";
const React = require("react");

const initialState = {
<<<<<<< HEAD
  location: sessionStorage.getItem("searchedLocation") || "",
  altLocation: "",
  stateName: "",
=======
  location: "",
  map: JSON.parse(sessionStorage.getItem("map")),
>>>>>>> 98952a65ba3a171c42dd5abbd18c3cdf8e906dd1
  numFacilities: 0,
  showPubchemInfo: false,
  chemicals: [],
  selectedChemicalList: [],
  currentChemical: "",
  activeTab: 0,
  error: false,
  graphsLoaded: false,
  filters: {
    chemical: "all",
    pbtsAndDioxins: false,
    carcinogens: false,
    releaseType: "all",
    year: 2018,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setError":
      return { ...state, error: action.payload };
    case "setLocation":
      return { ...state, location: action.payload };
<<<<<<< HEAD
    case "setStateName":
      return { ...state, stateName: action.payload };
    case "setStateLongName":
      return { ...state, stateLongName: action.payload };
    case "setAltLocation":
      return { ...state, altLocation: action.payload };
=======
>>>>>>> 98952a65ba3a171c42dd5abbd18c3cdf8e906dd1
    case "setNumFacilities":
      return { ...state, numFacilities: action.payload };
    case "setFilters":
      return { ...state, filters: action.payload };
    case "setCurrentChemical":
      return { ...state, currentChemical: action.payload };
    case "setMap":
      sessionStorage.setItem("map", JSON.stringify(action.payload));
      return {
        ...state,
        map: action.payload,
      };
    case "setChemicals":
      return {
        ...state,
        showPubchemInfo: false,
        chemicals: action.payload,
      };
    case "showPubchemInfo":
      return { ...state, showPubchemInfo: !state.showPubchemInfo };
    case "setActiveTab":
      return { ...state, activeTab: action.payload };
    case "loadGraphs":
      return { ...state, graphsLoaded: true };
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
<<<<<<< HEAD

const setLocation = (payload) => ({ type: "setLocation", payload });
const setStateName = (payload) => ({ type: "setStateName", payload });
const setStateLongName = (payload) => ({ type: "setStateLongName", payload });
const setError = (payload) => ({ type: "setError", payload });
=======
>>>>>>> 98952a65ba3a171c42dd5abbd18c3cdf8e906dd1
const setNumFacilities = (payload) => ({ type: "setNumFacilities", payload });
const setFilters = (payload) => ({ type: "setFilters", payload });
const refresh = () => ({ type: "refresh" });
const setMap = (payload) => ({ type: "setMap", payload });
const showPubchemInfo = () => ({ type: "showPubchemInfo" });
const setChemicals = (payload) => ({ type: "setChemicals", payload });
const loadGraphs = () => ({ type: "loadGraphs" });
const setCurrentChemical = (payload) => ({
  type: "setCurrentChemical",
  payload,
});

const getChemicals = async (facilityId, filters) => {
  const params = {
    carcinogen: filters.carcinogens || null,
    dioxin: filters.pbtsAndDioxins || null,
    pbt: filters.pbtsAndDioxins || null,
    release_type: filters.releaseType,
    year: filters.year,
  };

  const res = await vetapi.get(`/facilities/${facilityId}/chemicals`, {
    params,
  });
  const chemicals = res.data;
  return chemicals;
};

function ChemicalList(props) {
  const { chemicals } = props;
  if (chemicals.length === 0) return <div></div>;

  const listItems = chemicals
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((c) => {
      c.name = formatChemical(c.name);
      return (
        <li
          onClick={() => {
            props.onClick(c.name);
          }}
          key={c.name + " " + c.total}
        >
          {c.name} ({c.total.toLocaleString()} lbs)
        </li>
      );
    });
  return (
    <div>
      <ol>{listItems}</ol>
    </div>
  );
}

const App = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

<<<<<<< HEAD
  function handleSearchSubmit(location) {
    geocodeLocation(location)
      .then(() => {
        dispatch(setError(false));
        dispatch(setLastSearch(location));
        history.push("/fullview");
      })
      .catch((err) => {
        dispatch(setError(true));
        setTimeout(() => {
          dispatch(setError(false));
        }, 5000);
        console.log(err);
      });
  }

  async function geocodeLocation(location) {
    const res = await geocoder.get(`/json?address=${location}`);
    var i;
    for (i = 0; i < 5; i++)
      if (typeof res.data.results[0].address_components[i] !== "undefined")
        if (
          res.data.results[0].address_components[i].types[0] ===
          "administrative_area_level_1"
        ) {
          dispatch(
            setStateName(res.data.results[0].address_components[i].short_name)
          );
          dispatch(
            setStateLongName(
              res.data.results[0].address_components[i].long_name
            )
          );
        }
    dispatch(
      setMapView({
        center: res.data.results[0].geometry.location,
        viewport: res.data.results[0].geometry.viewport,
      })
    );
=======
  function handleSuccess(map) {
    dispatch(setMap(map));
    history.push("/map");
>>>>>>> 98952a65ba3a171c42dd5abbd18c3cdf8e906dd1
  }

  return (
    <Router history={history}>
      <div className="app-container">
        <div className="navigation">
          <div className="go-home">
            <Link to="/"> &lt; Back to home</Link>
          </div>
          <ul>
            <li className={state.activeTab === 0 ? "active" : ""}>
              <Link to="/map">Map</Link>
            </li>
            <li className={state.activeTab === 1 ? "active" : ""}>
              <Link to="/graphs">Graphs</Link>
            </li>
            <li className={state.activeTab === 2 ? "active" : ""}>
              <Link to="/thematicmaps">Thematic Maps</Link>
            </li>
          </ul>
        </div>
        <Switch>
          <Route exact path="/map">
            <div className="map-view">
              <div className="flex-item filter-wrapper">
                {/* VET MAP FILTER */}
                <div className="filters">
                  <div className="header">
                    {/* Search Bar Title and Image */}
                    <span>{state.numFacilities || 0}</span> Facilities found
                  </div>
                  <UserControlPanel
                    chemicals={state.selectedChemicalList}
                    filters={state.filters}
                    onFilterChange={(filters) =>
                      dispatch(setFilters(Object.assign({}, filters)))
                    }
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
                    {/* PUBCHEM DATA */}
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
              {/* GOOGLE MAPS RENDER */}
              <div className="flex-item map-wrapper">
                {state.map && (
                  <MapContainer
                    filters={Object.assign({}, state.filters)}
                    map={state.map}
                    onLoad={() => dispatch(loadGraphs())}
                    apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                    onTilesLoaded={() => dispatch(loadGraphs())}
                    onUpdate={(num) => dispatch(setNumFacilities(num))}
                    onRefresh={() => dispatch(refresh())}
                    onMarkerClick={(facilityId) => {
                      getChemicals(
                        facilityId,
                        state.filters
                      ).then((chemicals) => dispatch(setChemicals(chemicals)));
                    }}
                  />
                )}
              </div>
              <div className="flex-item"></div>
            </div>
          </Route>
          <Route path="/graphs">
            {/* VET GRAPHS */}
            {state.map && (
              <div className="graph-view">
                <GraphView
                  viewport={state.map.viewport}
                  filters={state.filters}
                  onFilterChange={(filters) =>
                    dispatch(setFilters(Object.assign({}, filters)))
                  }
                ></GraphView>
              </div>
            )}
          </Route>
          <Route path="/thematicmaps">
            {/* THEMATIC (CHLOROPLETH) MAPS */}
<<<<<<< HEAD
            <ThematicStateMap
              year={state.filters.year}
              type={state.filters.releaseType}
              stateName={state.stateName}
              stateLongName={state.stateLongName}
            >
              {" "}
            </ThematicStateMap>
            {/* <Footer /> */}
=======
            <div className="thematic-map-view">
              <ThematicMapView year={state.filters.year}></ThematicMapView>
            </div>
>>>>>>> 98952a65ba3a171c42dd5abbd18c3cdf8e906dd1
          </Route>
          <Route path="/thematicmaps">
            <ThematicMapView
              year={state.filters.year}
              type={state.filters.releaseType}
            >
              {" "}
            </ThematicMapView>
          </Route>
          <Route path="/">
            <Home isError={state.error} onSuccess={handleSuccess} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default withRouter(App);
