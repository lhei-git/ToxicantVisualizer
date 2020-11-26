/* eslint-disable import/first */
require("dotenv").config();
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  withRouter,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import history from "./history";
import Home from "./Home";
import MapContainer from "./MapContainer";
import GraphView from "./GraphView";
import GraphSummary from "./Graphs/Summary";
import PubChemFields from "./PubChemFields";
import UserControlPanel from "./UserControlPanel";
import ThematicMapView from "./ThematicMapView/index.js";
import ThematicStateMap from "./ThematicStateMap/index.js";
import React, { useReducer } from "react";
import { formatChemical, formatAmount } from "./helpers";
import vetapi from "./api/vetapi";

const initialState = {
  location: "",
  map: JSON.parse(sessionStorage.getItem("map")),
  numFacilities: 0,
  showPubchemInfo: false,
  chemicals: [],
  currentChemical: "",
  activeTab: 0,
  error: false,
  graphsLoaded: false,
  filters: {
    chemical: "all",
    pbtsAndDioxins: false,
    carcinogens: false,
    releaseType: "all",
    year: 2019,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setError":
      return { ...state, error: action.payload };
    case "setLocation":
      return { ...state, location: action.payload };
    case "setStateName":
      return { ...state, stateName: action.payload };
    case "setStateLongName":
      return { ...state, stateLongName: action.payload };
    case "setAltLocation":
      return { ...state, altLocation: action.payload };
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
    chemical: filters.chemical,
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
          <div className="dots">
            <span className="align-left">{c.name}</span>{" "}
          </div>
          <span className="align-right">{formatAmount(c.total)} lbs</span>
          <div style={{ clear: "both" }}></div>
        </li>
      );
    });
  return (
    <div className="chemical-list">
      <ol>{listItems}</ol>
    </div>
  );
}

const Navbar = (props) => {
  const location = useLocation();

  return (
    <div
      className={`navigation ${location.pathname === "/" ? "transparent" : ""}`}
    >
      <div className="logo">VET.</div>
      <ul>
        <li className={location.pathname === "/" ? "active" : ""}>
          <Link to="/">Search</Link>
        </li>
        {props.visible && (
          <li className={location.pathname === "/map" ? "active" : ""}>
            <Link to="/map">Facility Map</Link>
          </li>
        )}
        {props.visible && (
          <li className={location.pathname === "/graphs" ? "active" : ""}>
            <Link to="/graphs">Location Insights</Link>
          </li>
        )}
        {props.visible && (
          <li className={location.pathname === "/thematicmaps" ? "active" : ""}>
            <Link to="/thematicmaps">National Insights</Link>
          </li>
        )}
        {/* <li className={location.pathname === "/about" ? "active" : ""}>
          <Link to="/about">About</Link>
        </li> */}
      </ul>
    </div>
  );
};

const App = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  function getColor() {
    switch (state.filters.releaseType) {
      case "air":
        return "grey";
      case "water":
        return "green";
      case "land":
        return "brown";
      case "off_site":
        return "yellow";
      default:
        return "red";
    }
  }

  function handleSuccess(map) {
    dispatch(setMap(map));
    history.push("/map");
  }

  return (
    <Router history={history}>
      <div className="app-container">
        <Navbar visible={!!state.map} />
        <Switch>
          <Route exact path="/map">
            <div className="map-view">
              {/* VET MAP FILTER */}
              <div className="filters">
                <div className="placeholder"></div>
                <div className="header">
                  {/* <span>{state.numFacilities || 0}</span> Facilities found */}
                </div>
                <UserControlPanel
                  map={state.map}
                  filters={state.filters}
                  onFilterChange={(filters) => {
                    dispatch(setFilters(Object.assign({}, filters)));
                  }}
                ></UserControlPanel>
              </div>
              <div className="flex-container top">
                <div className="flex-item pubchem-wrapper">
                  {state.showPubchemInfo ? (
                    <div className="pubchem">
                      <div
                        className="back"
                        onClick={() => {
                          dispatch(showPubchemInfo());
                        }}
                      >
                        <span>
                          <img
                            src={require("./../src/assets/leftcarat.png")}
                            alt=""
                          ></img>
                        </span>
                        Back to Chemicals
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
                        <div className="caption">
                          Click on toxicant to see detailed chemical
                          information.
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
                        ).then((chemicals) =>
                          dispatch(setChemicals(chemicals))
                        );
                      }}
                    />
                  )}
                  <div className="legend">
                    <ul style={{ listStyle: "none" }}>
                      <li>
                        <span class="marker">
                          <img
                            src={require("./../src/assets/" +
                              getColor() +
                              "_1-6.png")}
                            alt=""
                          ></img>
                        </span>
                        0 lbs
                      </li>
                      <li>
                        {" "}
                        <span class="marker">
                          <img
                            src={require("./../src/assets/" +
                              getColor() +
                              "_2-6.png")}
                            alt=""
                          ></img>
                        </span>
                        0 - 100 lbs
                      </li>
                      <li>
                        {" "}
                        <span class="marker">
                          <img
                            src={require("./../src/assets/" +
                              getColor() +
                              "_3-6.png")}
                            alt=""
                          ></img>
                        </span>
                        100 - 10,000 lbs
                      </li>
                      <li>
                        {" "}
                        <span class="marker">
                          <img
                            src={require("./../src/assets/" +
                              getColor() +
                              "_4-6.png")}
                            alt=""
                          ></img>
                        </span>
                        10,000 - 100,000 lbs
                      </li>
                      <li>
                        {" "}
                        <span class="marker">
                          <img
                            src={require("./../src/assets/" +
                              getColor() +
                              "_5-6.png")}
                            alt=""
                          ></img>
                        </span>
                        100,000 - 1,000,000 lbs
                      </li>
                      <li>
                        {" "}
                        <span class="marker">
                          <img
                            src={require("./../src/assets/" +
                              getColor() +
                              "_6-6.png")}
                            alt=""
                          ></img>
                        </span>
                        &lt;1,000,000 lbs
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              {state.map && (
                <div>
                  <div>
                    <GraphSummary
                      map={state.map}
                      filters={state.filters}
                    ></GraphSummary>
                  </div>
                  {state.map.stateShort !== "US" && (
                    <div>
                      <ThematicStateMap
                        year={state.filters.year}
                        type={state.filters.releaseType}
                        stateName={state.map.stateShort}
                        stateLongName={state.map.stateLong}
                      ></ThematicStateMap>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Route>
          <Route path="/graphs">
            {/* VET GRAPHS */}
            {state.map && (
              <div className="graph-view">
                <GraphView
                  map={state.map}
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
            <ThematicMapView
              year={state.filters.year}
              type={state.filters.releaseType}
            >
              {" "}
            </ThematicMapView>
          </Route>
          {/* <Route path="/about"></Route> */}
          <Route path="/">
            <Home isError={state.error} onSuccess={handleSuccess} />
          </Route>
        </Switch>
        <div className="footer">
          <ul>
            <li>
              <a href="https://github.com/ejdejesu/ToxicantVisualizer">
                Github
              </a>
            </li>
            <li>
              <a href="https://pubchem.ncbi.nlm.nih.gov/">Pubchem</a>
            </li>
            <li>
              <a href="https://www.epa.gov/toxics-release-inventory-tri-program">
                TRI Program
              </a>
            </li>
            {/* <li>
              <Link to="/about">About</Link>
            </li> */}
          </ul>
          <div>
            <div className="copyright">
              &#169; VET was developed in 2020 for the Lab for Health and
              Environmental Information by Evan de Jesus, Adwait Wadekar,
              Richard Moore, and Calvin Brooks
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default withRouter(App);
