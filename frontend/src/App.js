//==========================================
// Author: Evan de Jesus
// Date:   12/10/2020
//==========================================

/* eslint-disable import/first */
require("dotenv").config();
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  withRouter,
  useLocation,
  Redirect,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import history from "./history";
import Home from "./HomeView";
import GraphView from "./GraphView";
import ThematicMapView from "./ThematicMapView/index.js";
import AboutPage from "./About/index";
import React, { useReducer } from "react";
import MapView from "./MapView";
import PropTypes from "prop-types";

/* Initial state of app */
const initialState = {
  map: JSON.parse(sessionStorage.getItem("map")),
  filters: {
    chemical: "all",
    pbt: false,
    carcinogen: false,
    releaseType: "all",
    year: 2019,
  },
  errorMessage: "",
};

/* handler for updating state */
const reducer = (state, action) => {
  switch (action.type) {
    case "setMap":
      /* Store latest searched location in session */
      sessionStorage.setItem("map", JSON.stringify(action.payload));
      return {
        ...state,
        map: action.payload,
      };
    case "setFilters":
      const newFilters = Object.assign({}, action.payload);
      return { ...state, filters: newFilters };

    case "setErrorMessage":
      return { ...state, errorMessage: action.payload };
    default:
      throw new Error();
  }
};

/* individual state setters */
const setMap = (payload) => ({ type: "setMap", payload });
const setFilters = (payload) => ({ type: "setFilters", payload });
const setErrorMessage = (payload) => ({ type: "setErrorMessage", payload });

/* Navbar component */
const Navbar = (props) => {
  // webpage path
  const location = useLocation();

  /* Only shows other paths when a search has been initiated */
  return (
    <div
      className={`navigation ${location.pathname === "/" ? "transparent" : ""}`}
    >
      <div className="logo">
        <Link to="/">VET.</Link>
      </div>
      <ul>
        <li className={location.pathname === "/" ? "active" : ""}>
          <Link to="/">Search</Link>
        </li>
        {props.visible && (
          <>
            <li className={location.pathname === "/map" ? "active" : ""}>
              <Link to="/map">Facility Map</Link>
            </li>
            <li className={location.pathname === "/graphs" ? "active" : ""}>
              <Link to="/graphs">Location Insights</Link>
            </li>
            <li
              className={location.pathname === "/thematicmaps" ? "active" : ""}
            >
              <Link to="/thematicmaps">National Insights</Link>
            </li>
            <li className={location.pathname === "/about" ? "active" : ""}>
              <Link to="/about">About</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};
Navbar.propTypes = {
  visible: PropTypes.bool,
};

/* Footer component */
function Footer() {
  return (
    <div className="footer">
      <div className="copyright">
        &#169; VET was developed in 2020 for the Lab for Health and
        Environmental Information by Evan de Jesus, Adwait Wadekar, Richard
        Moore, and Calvin Brooks
      </div>
    </div>
  );
}

const App = (props) => {
  /* Use reducer method to update state */
  const [state, dispatch] = useReducer(reducer, initialState);

  /* Error handler when API is down */
  function toggleError() {
    dispatch(setErrorMessage("Server request failed, please try again later."));
    setTimeout(() => {
      dispatch(setErrorMessage(""));
    }, 10000);
  }

  /* The geocoder has completed a successful search */
  function handleSuccess(map) {
    /* Set app-wide location setting */
    dispatch(setMap(map));
    /* Clear existing facility data */
    sessionStorage.removeItem("facilityData");
    /* redirect to the /map page */
    history.push("/map");
  }

  return (
    /* Entire app is wrapped by router object. Router handles requests to other pages */
    <Router history={history}>
      <Navbar visible={!!state.map} />
      {state.errorMessage !== "" && (
        <div className="error" onClick={() => dispatch(setErrorMessage(""))}>
          {state.errorMessage}
          <div>x</div>
        </div>
      )}
      <div className="app-container">
        <Switch>
          <Route exact path="/map">
            {/* Map, summary, and state thematic map */}
            <MapView
              map={state.map}
              filters={state.filters}
              onFilterChange={(filters) => dispatch(setFilters(filters))}
            ></MapView>
          </Route>
          <Route path="/graphs">
            {/* Top ten graphs, timeline graphs, index graphs */}
            {state.map ? (
              <div className="graph-view">
                <GraphView
                  map={state.map}
                  filters={state.filters}
                  onApiError={toggleError}
                  onFilterChange={(filters) => dispatch(setFilters(filters))}
                ></GraphView>
              </div>
            ) : (
              <Redirect to="/" />
            )}
          </Route>
          <Route path="/thematicmaps">
            {/* county and state-level thematic maps for U.S. */}
            {state.map ? (
              <ThematicMapView
                map={state.map}
                filters={state.filters}
                onApiError={toggleError}
                onFilterChange={(filters) => dispatch(setFilters(filters))}
              ></ThematicMapView>
            ) : (
              <Redirect to="/" />
            )}
          </Route>
          <Route path="/about" component={AboutPage}></Route>
          <Route path="/">
            {/* home page */}
            <Home onSuccess={handleSuccess} />
          </Route>
        </Switch>
        <Footer></Footer>
      </div>
    </Router>
  );
};

export default withRouter(App);
