/* eslint-disable import/first */
require("dotenv").config();
import GoogleMap from "../GoogleMap";
import GraphSummary from "../GraphView/Summary";
import PubchemView from "../Pubchem";
import FilterView from "../Filters";
import MapLegend from "../MapLegend";
import ThematicStateMap from "../ThematicStateMap/index.js";
import { formatChemical, formatAmount, getLocationString } from "../helpers";
import vetapi from "../api/vetapi";
import "./index.css";
import React from "react";

const initialState = {
  location: "",
  map: JSON.parse(sessionStorage.getItem("map")),
  numFacilities: 0,
  showPubchemInfo: false,
  chemicals: [],
  currentChemical: "",
  activeTab: 0,

  filters: {
    chemical: "all",
    pbt: false,
    carcinogen: false,
    releaseType: "all",
    year: 2019,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setNumFacilities":
      return { ...state, numFacilities: action.payload };
    case "setFilters":
      return { ...state, filters: action.payload };
    case "refresh":
      return {
        ...state,
        chemicals: [],
        showPubchemInfo: false,
      };
    case "showPubchemInfo":
      return { ...state, showPubchemInfo: !state.showPubchemInfo };
    case "setChemicals":
      return {
        ...state,
        showPubchemInfo: false,
        chemicals: action.payload,
      };
    case "setCurrentChemical":
      return { ...state, currentChemical: action.payload };
    default:
      throw new Error();
  }
};

const setNumFacilities = (payload) => ({ type: "setNumFacilities", payload });
const setFilters = (payload) => ({ type: "setFilters", payload });
const refresh = () => ({ type: "refresh" });
const showPubchemInfo = () => ({ type: "showPubchemInfo" });
const setChemicals = (payload) => ({ type: "setChemicals", payload });
const setCurrentChemical = (payload) => ({
  type: "setCurrentChemical",
  payload,
});

const getChemicals = async (facilityId, filters) => {
  const params = {
    carcinogen: filters.carcinogens || null,
    dioxin: filters.pbt || null,
    pbt: filters.pbt || null,
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

function MapView(props) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <div className="map-view">
      {/* VET MAP FILTER */}
      <div className="filters">
        <div className="header">
          {state.map && <h1>{getLocationString(state.map, true)}</h1>}
        </div>
        <FilterView
          map={state.map}
          filters={state.filters}
          onFilterChange={(filters) => {
            dispatch(setFilters(Object.assign({}, filters)));
          }}
        ></FilterView>
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
                    src={require("../../src/assets/leftcarat.png")}
                    alt=""
                  ></img>
                </span>
                Back to Chemicals
              </div>
              <PubchemView chemName={state.currentChemical}></PubchemView>
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
                  Click on toxicant to see detailed chemical information.
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
            <div>
              <GoogleMap
                filters={Object.assign({}, state.filters)}
                map={state.map}
                apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                onUpdate={(num) => dispatch(setNumFacilities(num))}
                onRefresh={() => dispatch(refresh())}
                onMarkerClick={(facilityId) => {
                  getChemicals(facilityId, state.filters).then((chemicals) =>
                    dispatch(setChemicals(chemicals))
                  );
                }}
              />
              <MapLegend releaseType={state.filters.releaseType}></MapLegend>
            </div>
          )}
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
                releaseType={state.filters.releaseType}
                stateName={state.map.state}
                stateLongName={state.map.stateLong}
              ></ThematicStateMap>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MapView;
