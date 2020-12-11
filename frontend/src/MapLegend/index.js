import React from "react";
import "./index.css";

import PropTypes from "prop-types";

/* Map legend changes colors of icons depending on release type shown */
function MapLegend(props) {
  function getColor(type) {
    switch (type) {
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

  return (
    <div className="legend">
      <div>Total release amount (lbs)</div>
      <ul style={{ listStyle: "none" }}>
        <li>
          <span className="marker">
            <img
              src={require("../../src/assets/" +
                getColor(props.releaseType) +
                "_1-6.png")}
              alt=""
            ></img>
          </span>
          0 lbs
        </li>
        <li>
          {" "}
          <span className="marker">
            <img
              src={require("../../src/assets/" +
                getColor(props.releaseType) +
                "_2-6.png")}
              alt=""
            ></img>
          </span>
          0 - 100 lbs
        </li>
        <li>
          {" "}
          <span className="marker">
            <img
              src={require("../../src/assets/" +
                getColor(props.releaseType) +
                "_3-6.png")}
              alt=""
            ></img>
          </span>
          100 - 10,000 lbs
        </li>
        <li>
          {" "}
          <span className="marker">
            <img
              src={require("../../src/assets/" +
                getColor(props.releaseType) +
                "_4-6.png")}
              alt=""
            ></img>
          </span>
          10,000 - 100,000 lbs
        </li>
        <li>
          {" "}
          <span className="marker">
            <img
              src={require("../../src/assets/" +
                getColor(props.releaseType) +
                "_5-6.png")}
              alt=""
            ></img>
          </span>
          100,000 - 1,000,000 lbs
        </li>
        <li>
          {" "}
          <span className="marker">
            <img
              src={require("../../src/assets/" +
                getColor(props.releaseType) +
                "_6-6.png")}
              alt=""
            ></img>
          </span>
          &gt;1,000,000 lbs
        </li>
      </ul>
    </div>
  );
}
MapLegend.propTypes = {
  releaseType: PropTypes.oneOf([
    "all",
    "air",
    "water",
    "land",
    "on_site",
    "off_site",
  ]),
};

export default MapLegend;
