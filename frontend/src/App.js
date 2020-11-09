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
import { useReducer, useRef } from "react";
import { formatChemical } from "./helpers";
import vetapi from "./api/vetapi";
const geocoder = require("./api/geocoder");
const React = require("react");

const INITIAL_CENTER = {
  lat: 39.8283,
  lng: -98.5795,
};

const initialState = {
  location: sessionStorage.getItem("searchedLocation") || "",
  altLocation: "",
  numFacilities: 0,
  lastSearch: "",
  center: INITIAL_CENTER,
  viewport: null,
  showPubchemInfo: false,
  chemicals: [],
  selectedChemicalList: [],
  currentChemical: "",
  activeTab: 0,
  error: false,
  loadedGraphs: false,
  filters: {
    chemical: "all",
    dioxins: false,
    pbts: false,
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
    case "setAltLocation":
      return { ...state, altLocation: action.payload };
    case "setNumFacilities":
      return { ...state, numFacilities: action.payload };
    case "setFilters":
      return { ...state, filters: action.payload };
    case "setCurrentChemical":
      return { ...state, currentChemical: action.payload };
    case "setMapView":
      return {
        ...state,
        center: action.payload.center,
        viewport: action.payload.viewport,
      };
    case "setChemicals":
      return {
        ...state,
        showPubchemInfo: false,
        chemicals: action.payload,
      };
    case "setLastSearch":
      sessionStorage.setItem("searchedLocation", state.location);
      return { ...state, lastSearch: action.payload };
    case "showPubchemInfo":
      return { ...state, showPubchemInfo: !state.showPubchemInfo };
    case "setActiveTab":
      return { ...state, activeTab: action.payload };
    case "loadGraphs":
      return { ...state, loadedGraphs: true };
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
const setError = (payload) => ({ type: "setError", payload });
const setNumFacilities = (payload) => ({ type: "setNumFacilities", payload });
const setFilters = (payload) => ({ type: "setFilters", payload });
const refresh = () => ({ type: "refresh" });
const setLastSearch = (payload) => ({ type: "setLastSearch", payload });
const setMapView = (payload) => ({ type: "setMapView", payload });
const showPubchemInfo = () => ({ type: "showPubchemInfo" });
const setChemicals = (payload) => ({ type: "setChemicals", payload });
const setActiveTab = (payload) => ({ type: "setActiveTab", payload });
const loadGraphs = () => ({ type: "loadGraphs" });
const setCurrentChemical = (payload) => ({
  type: "setCurrentChemical",
  payload,
});

const getChemicals = async (facilityId) => {
  const res = await vetapi.get(`/facilities/${facilityId}/chemicals`);
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

const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);
// General scroll to element function

const App = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const summaryRef = useRef();
  const graphRef = useRef();
  const thematicRef = useRef();

  const executeScroll = (ref) => scrollToRef(ref);

  const handleScroll = (event) => {
    try {
      const cur = event.target.scrollingElement.scrollTop;
      if (summaryRef && cur <= summaryRef.current.offsetTop) {
        // dispatch(setActiveTab(0));
      } else if (cur <= graphRef.current.offsetTop) {
        if (!state.loadedGraphs) {
          dispatch(loadGraphs());
        }
        // dispatch(setActiveTab(1));
      } else {
        // dispatch(setActiveTab(2));
      }
    } catch (err) {
      console.log(err);
    }
  };

  // fetches data when component is updated
  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    if (state.viewport === null) geocodeLocation(state.location);
  }, [state.location, state.viewport]);

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
        <Switch>
          <Route path="/fullview">
            <div className="navigation">
              <div className="go-home">
                <Link to="/"> &lt; Back to home</Link>
              </div>
              {/* <div className="flex-item">
                <div className="alt-input">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSearchSubmit(altLocationInput.current.value);
                    }}
                  >
                    <label htmlFor="alt-input">Location:</label>
                    <input
                      type="text"
                      name="alt-input"
                      id=""
                      value={state.altLocation}
                      onChange={(event) => {
                        dispatch(setAltLocation(event.target.value));
                      }}
                      ref={altLocationInput}
                    />
                  </form>
                </div>
              </div> */}
              <ul>
                <li
                  className={state.activeTab === 0 ? "active" : ""}
                  onClick={() => {
                    executeScroll(summaryRef);
                    dispatch(setActiveTab(0));
                  }}
                >
                  Summary
                </li>
                <li
                  className={state.activeTab === 1 ? "active" : ""}
                  onClick={() => {
                    executeScroll(graphRef);
                    dispatch(setActiveTab(1));
                  }}
                >
                  Graphs
                </li>
                <li
                  className={state.activeTab === 2 ? "active" : ""}
                  onClick={() => {
                    executeScroll(thematicRef);
                    dispatch(setActiveTab(2));
                  }}
                >
                  Thematic Maps
                </li>
              </ul>
            </div>
            {/* <div className="title">
              <div className="go-home">
                <Link to="/"> &lt; Back to home</Link>
              </div>
              <div className="hamburger">
                <img
                  src={require("./../src/assets/hamburger_icon.svg")}
                  alt=""
                />
              </div>
            </div> */}
            <div className="map-view">
              <div className="flex-item filter-wrapper">
                {/* VET MAP FILTER */}
                <div className="filters" ref={summaryRef}>
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
                {state.viewport && (
                  <MapContainer
                    filters={Object.assign({}, state.filters)}
                    center={state.center}
                    viewport={state.viewport}
                    onLoad={() => dispatch(loadGraphs())}
                    apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                    onUpdate={(num) => dispatch(setNumFacilities(num))}
                    onRefresh={() => dispatch(refresh())}
                    onMarkerClick={(facilityId) => {
                      getChemicals(facilityId).then((chemicals) =>
                        dispatch(setChemicals(chemicals))
                      );
                    }}
                  />
                )}
              </div>
              <div className="flex-item"></div>
            </div>
            {/* VET GRAPHS */}
            <div className="graph-view" ref={graphRef}>
              {state.loadedGraphs && (
                <GraphView
                  viewport={state.viewport}
                  year={state.filters.year}
                ></GraphView>
              )}
            </div>
            {/* THEMATIC (CHLOROPLETH) MAPS */}
            {/* <div className="thematic-map-view" ref={thematicRef}>
              <ThematicMapView year={state.filters.year}></ThematicMapView>
            </div> */}
            {/* <Footer /> */}
          </Route>
          <Route path="/">
            <Home
              isError={state.error}
              onSearchChange={(search) => dispatch(setLocation(search))}
              onSearchSubmit={() => handleSearchSubmit(state.location)}
            />
            <Footer />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default withRouter(App);
