/* eslint-disable import/first */
require("dotenv").config();
import GoogleMap from "../GoogleMap";
import GraphSummary from "../GraphView/Summary";
import PubchemView from "../Pubchem";
import FilterView from "../Filters";
import MapLegend from "../MapLegend";
import ThematicStateMap from "../ThematicStateMap/index.js";
import { formatChemical, formatAmount } from "../helpers";
import vetapi from "../api/vetapi";
import "./index.css";
import React from "react";
import PropTypes from "prop-types";

const initialState = {
  location: "",
  showPubchemInfo: false,
  chemicals: [],
  currentChemical: "",
};

const reducer = (state, action) => {
  switch (action.type) {
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

const refresh = () => ({ type: "refresh" });
const showPubchemInfo = () => ({ type: "showPubchemInfo" });
const setChemicals = (payload) => ({ type: "setChemicals", payload });
const setCurrentChemical = (payload) => ({
  type: "setCurrentChemical",
  payload,
});

const getChemicals = async (facilityId, filters) => {
  const params = {
    carcinogen: filters.carcinogen || null,
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

/* Component for a facility's list of chemicals, shows when facility is clicked */
function ChemicalList({ chemicals, onClick }) {
  if (chemicals.length === 0) return <div></div>;

  /* Format each chemical into a split row using name and release amount */
  const listItems = chemicals
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((c) => {
      c.name = formatChemical(c.name);
      return (
        <li
          onClick={() => {
            onClick(c.name);
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
ChemicalList.propTypes = {
  chemicals: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
    })
  ),
  onClick: PropTypes.func.isRequired,
};

function MapView({ map, filters, onFilterChange }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <div className="map-view">
      <div className="filters">
        {/* Filter component */}
        <FilterView
          map={map}
          filters={filters}
          onFilterChange={onFilterChange}
        ></FilterView>
      </div>
      <div className="flex-container top">
        {/* Only show pubchem sidebar if facility has been clicked */}
        {state.chemicals.length !== 0 && (
          <div className="flex-item pubchem-wrapper">
            {/* Only show pubchem data if a chemical has been clicked */}
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
              /* Actually show chemical list */
              <div className="chemicals">
                <div className="caption">
                  Click on toxicant to see detailed chemical information.
                </div>
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
        )}
        {/* Google Map (requires api keys and google as a property of the window)*/}
        <div className="flex-item map-wrapper">
          {map && (
            <div>
              <GoogleMap
                filters={filters}
                map={map}
                apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                onRefresh={() => dispatch(refresh())}
                onMarkerClick={(facilityId) => {
                  getChemicals(facilityId, filters).then((chemicals) =>
                    dispatch(setChemicals(chemicals))
                  );
                }}
              />
              {/* Legend updates with colors of selected release type */}
              <MapLegend releaseType={filters.releaseType}></MapLegend>
            </div>
          )}
        </div>
      </div>
      {/* Summary table and state thematic map. Only show if a search has been completed */}
      {map && (
        <div className="summary-container">
          <div>
            <GraphSummary map={map} filters={filters}></GraphSummary>
          </div>
          {!["US", "DC"].includes(map.state) && (
            <div>
              <ThematicStateMap
                filters={filters}
                stateName={map.state}
                stateLongName={map.stateLong}
              ></ThematicStateMap>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
MapView.propTypes = {
  filters: PropTypes.shape({
    chemical: PropTypes.string.isRequired,
    pbt: PropTypes.bool.isRequired,
    carcinogen: PropTypes.bool.isRequired,
    releaseType: PropTypes.oneOf([
      "all",
      "air",
      "water",
      "land",
      "on_site",
      "off_site",
    ]).isRequired,
    year: PropTypes.number.isRequired,
  }),
  map: PropTypes.shape({
    city: PropTypes.string,
    county: PropTypes.string,
    state: PropTypes.string,
    stateLong: PropTypes.string,
    center: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }).isRequired,
    viewport: PropTypes.shape({
      northeast: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }).isRequired,
      southwest: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }).isRequired,
    }),
  }),
  onFilterChange: PropTypes.func.isRequired,
};

export default MapView;
