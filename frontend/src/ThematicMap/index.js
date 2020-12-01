import React, { memo, useState, useEffect } from "react";
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import "./index.css";

// used to produce more easily readable numbers
const rounded = (num) => {
  if (num >= 1000000000) {
    return Math.round(num / 100000000) / 10 + "Bn";
  } else if (num >= 1000000) {
    return Math.round(num / 100000) / 10 + "M";
  } else if (num >= 1000) {
    return Math.round(num / 100) / 10 + "K";
  } else return num;
};

const ThematicMap = (props) => {
  const [position, setPosition] = useState({ coordinates: [-96, 38], zoom: 1 });

  if (!props.data) return null;

  function colorScaleCounty(val) {
    if (val == 0) return "#FCDBC6";
    else if (val < 1000) return "#FBCBCA";
    else if (val < 10000) return "#F2A598";
    else if (val < 100000) return "#F65858";
    else if (val < 1000000) return "#E00E0E";
    else return "#A60A0A";
  }

  function colorScaleState(val) {
    if (val == 0) return "#FCDBC6";
    else if (val < 1000000) return "#FBCBCA";
    else if (val < 10000000) return "#F2A598";
    else if (val < 50000000) return "#F65858";
    else if (val < 100000000) return "#E00E0E";
    else return "#A60A0A";
  }

  function handleZoomIn() {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
  }

  function handleMoveEnd(position) {
    setPosition(position);
  }

  function handleReturnToCenter() {
    setPosition({ coordinates: [-96, 38], zoom: 1 });
  }

  const filterType = props.filterType !== null ? props.filterType : "total";

  //////  used to render the state based map  //////
  if (props.type === "states")
    return (
      <>
        <div className="thematic-map-container">
          <ComposableMap data-tip="" projection="geoAlbersUsa">
            <Geographies geography={props.geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  var cur = props.data.find(
                    (s) => s.facility__state === geo.properties.iso_3166_2
                  );
                  if (cur !== undefined) {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScaleState(cur ? cur[filterType] : 0)}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(null);
                          props.setTooltipContent(`<h1><p style="text-align:center;">${
                            geo.properties.name
                          }</h1></p> <br /><span class="geography-attributes">
                                                Total: ${rounded(
                                                  Math.trunc(cur.total)
                                                )} lbs. <br />
                                                Facilities: ${rounded(
                                                  Math.trunc(cur.num_facilities)
                                                )} </br>
                                                Air: ${rounded(
                                                  Math.trunc(cur.air)
                                                )} lbs. <br />
                                                Water: ${rounded(
                                                  Math.trunc(cur.water)
                                                )} lbs. <br />
                                                Land: ${rounded(
                                                  Math.trunc(cur.land)
                                                )} lbs. <br />
                                                Offsite: ${rounded(
                                                  Math.trunc(cur.off_site)
                                                )} lbs. <br />
                                                Onsite: ${rounded(
                                                  Math.trunc(cur.on_site)
                                                )} lbs. <span />
                                                `);
                        }}
                        onMouseLeave={() => {
                          props.setTooltipContent("");
                        }}
                      />
                    );
                  }
                })
              }
            </Geographies>
          </ComposableMap>
          <Legend
            colorScale={colorScale}
            filterType={filterType}
            maxVal={props.maxValue}
            minVal={props.minValue}
          ></Legend>
        </div>
      </>
    );
  //////  used to render the county based map  //////
  else if (props.type === "counties")
    return (
      <>
        <div className="thematic-map-container">
          <ComposableMap data-tip="" projection="geoAlbersUsa">
            <Geographies geography={props.geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  var cur = props.data.find(
                    (s) =>
                      s.facility__county.slice(0, 3) ===
                        geo.properties.name.toUpperCase().slice(0, 3) &&
                      s.facility__state === geo.properties.iso_3166_2
                  );
                  if (cur !== undefined) {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScale(cur ? cur[filterType] : 0)}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(null);
                        }}
                      />
                    );
                  } else {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScaleState(0)}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(null);
                          props.setTooltipContent(`<h1><p style="text-align:center;">${geo.properties.name}</p></h1><br />
                                         <span class="geography-attributes"> No releases reported in ${props.filterYear}</span>
                `);
                        }}
                        onMouseLeave={() => {
                          props.setTooltipContent(null);
                        }}
                      />
                    );
                  }
                })
              }
            </Geographies>
          </ComposableMap>
          <LegendState
            colorScale={colorScaleState}
            filterType={filterType}
            maxVal={props.maxValue}
            minVal={props.minValue}
          ></LegendState>
        </div>
      </>
    );
  //////  used to render the county based map  //////
  else if (props.type === "counties")
    return (
      <>
        <div className="thematic-map-container">
          <ComposableMap data-tip="" projection="geoAlbersUsa">
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
            >
              <Geographies geography={props.geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    var cur = props.data.find(
                      (s) =>
                        s.facility__county.slice(0, 3) ===
                          geo.properties.name.toUpperCase().slice(0, 3) &&
                        s.facility__state === geo.properties.iso_3166_2
                    );
                    if (cur !== undefined) {
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={colorScaleCounty(cur ? cur[filterType] : 0)}
                          stroke={"#000"}
                          onMouseEnter={() => {
                            props.setTooltipContent(null);
                            props.setTooltipContent(`<h1><p style="text-align:center;">${
                              cur.facility__county
                            } COUNTY</p></h1><span class="geography-attributes"><br />
                                                    Onsite: ${rounded(
                                                      Math.trunc(cur.on_site)
                                                    )} lbs. <br />
                                                    Air: ${rounded(
                                                      Math.trunc(cur.air)
                                                    )} lbs. <br />
                                                    Water: ${rounded(
                                                      Math.trunc(cur.water)
                                                    )} lbs. <br />
                                                    Land: ${rounded(
                                                      Math.trunc(cur.land)
                                                    )} lbs. <br />
                                                    Offsite: ${rounded(
                                                      Math.trunc(cur.off_site)
                                                    )} lbs. <br />
                                                    Total: ${rounded(
                                                      Math.trunc(cur.total)
                                                    )} lbs. <br />
                                                    Facilities: ${rounded(
                                                      Math.trunc(
                                                        cur.num_facilities
                                                      )
                                                    )} </span>
                        `);
                          }}
                          onMouseLeave={() => {
                            props.setTooltipContent(null);
                          }}
                        />
                      );
                    } else {
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={colorScaleCounty(0)}
                          stroke={"#000"}
                          onMouseEnter={() => {
                            props.setTooltipContent(null);
                            props.setTooltipContent(`<h1><p style="text-align:center;">${geo.properties.name.toUpperCase()} COUNTY</p></h1><br />
                                                 <span class="geography-attributes"> No releases reported in ${
                                                   props.filterYear
                                                 }</span>
                        `);
                          }}
                          onMouseLeave={() => {
                            props.setTooltipContent(null);
                          }}
                        />
                      );
                    }
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          <div className="controls">
            <button onClick={handleZoomIn}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button onClick={handleZoomOut}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button onClick={handleReturnToCenter}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="124"
                height="24"
                viewBox="0 0 24 24"
                //stroke="currentColor"
              >
                <text
                  x="50%"
                  y="50%"
                  fill="black"
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  {" "}
                  Return to Center{" "}
                </text>
              </svg>
            </button>
          </div>
          <Legend
            colorScale={colorScaleCounty}
            filterType={filterType}
            maxVal={props.maxValue}
            minVal={props.minValue}
          ></Legend>
        </div>
      </>
    );
  //////  covers single state  //////
  else {
    return (
      <>
        <div className="thematic-map-container">
          <ComposableMap
            data-tip=""
            projection="geoMercator"
            projectionConfig={{
              rotate: [0, 0, 0],
              center: [props.lon, props.lat],
              scale: props.scale,
            }}
          >
            <Geographies geography={props.geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  var cur = props.data.find(
                    (s) =>
                      s.facility__county.split(" ")[0].split(".")[0] ===
                      geo.properties.NAME.toUpperCase()
                        .split(" ")[0]
                        .split(".")[0]
                  );
                  if (cur !== undefined) {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScaleCounty(cur ? cur[filterType] : 0)}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(`<h1><p style="text-align:center;">${
                            cur.facility__county
                          } COUNTY</p></h1><span class="geography-attributes"><br />
                                            Onsite: ${rounded(
                                              Math.trunc(cur.on_site)
                                            )} lbs. <br />
                                            Air: ${rounded(
                                              Math.trunc(cur.air)
                                            )} lbs. <br />
                                            Water: ${rounded(
                                              Math.trunc(cur.water)
                                            )} lbs. <br />
                                            Land: ${rounded(
                                              Math.trunc(cur.land)
                                            )} lbs. <br />
                                            Offsite: ${rounded(
                                              Math.trunc(cur.off_site)
                                            )} lbs. <br />
                                            Total: ${rounded(
                                              Math.trunc(cur.total)
                                            )} lbs. <br />
                                            Facilities: ${rounded(
                                              Math.trunc(cur.num_facilities)
                                            )} </span>
                `);
                        }}
                        onMouseLeave={() => {
                          props.setTooltipContent(null);
                        }}
                      />
                    );
                  } else {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScaleCounty(0)}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(null);
                          props.setTooltipContent(`<h1><p style="text-align:center;">${geo.properties.NAME.toUpperCase()} COUNTY</p></h1><br />
                                         <span class="geography-attributes"> No releases reported in ${
                                           props.filterYear
                                         }</span>
                `);
                        }}
                        onMouseLeave={() => {
                          props.setTooltipContent(null);
                        }}
                      />
                    );
                  }
                })
              }
            </Geographies>
          </ComposableMap>
          <Legend
            colorScale={colorScaleCounty}
            filterType={filterType}
            maxVal={props.maxValue}
            minVal={props.minValue}
          ></Legend>
        </div>
      </>
    );
  }
};

// creates svg gradient legen based on min and max values and color scale
function Legend(props) {
  return (
    <svg height="25" width="100%" margin="5px">
      <rect
        height="100"
        width="16.6%"
        fill={props.colorScale(0)}
        strokeWidth="1"
        stroke="black"
      />
      <rect
        x="16.6%"
        height="100"
        width="16.6%"
        fill="#FBCBCA"
        strokeWidth="1"
        stroke="black"
      />
      <rect
        x="33.2%"
        height="100"
        width="16.6%"
        fill={props.colorScale(9999)}
        strokeWidth="1"
        stroke="black"
      />
      <rect
        x="49.8%"
        height="100"
        width="16.6%"
        fill={props.colorScale(99999)}
        strokeWidth="1"
        stroke="black"
      />
      <rect
        x="66.4%"
        height="100"
        width="16.6%"
        fill={props.colorScale(999999)}
        strokeWidth="1"
        stroke="black"
      />
      <rect
        x="83%"
        height="100"
        width="16.6%"
        fill={props.colorScale(9999999)}
        strokeWidth="1"
        stroke="black"
      />
      <text
        x="1%"
        y="50%"
        fill="black"
        dominantBaseline="middle"
        textAnchor="start"
      >
        0 lbs.
      </text>
      <text
        x="17.7%"
        y="50%"
        fill="black"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {"<"} {rounded(Math.trunc(1000))} lbs.
      </text>
      <text
        x="34.3%"
        y="50%"
        fill="black"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {"<"} {rounded(Math.trunc(10000))} lbs.
      </text>
      <text
        x="50.9%"
        y="50%"
        fill="white"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {"<"} {rounded(Math.trunc(100000))} lbs.
      </text>
      <text
        x="67.5%"
        y="50%"
        fill="white"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {"<"} {rounded(Math.trunc(1000000))} lbs.
      </text>
      <text
        x="84.1%"
        y="50%"
        fill="white"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {">"} {rounded(Math.trunc(1000000))} lbs.
      </text>
    </svg>
  );
}

function LegendState(props) {
  return (
    <svg height="25" width="100%" margin="5px">
      <rect
        height="100"
        width="16.6%"
        fill={props.colorScale(0)}
        strokeWidth="1"
        stroke="black"
      />
      <rect
        x="16.6%"
        height="100"
        width="16.6%"
        fill={props.colorScale(999999)}
        strokeWidth="1"
        stroke="black"
      />
      <rect
        x="33.2%"
        height="100"
        width="16.6%"
        fill={props.colorScale(9999999)}
        strokeWidth="1"
        stroke="black"
      />
      <rect
        x="49.8%"
        height="100"
        width="16.6%"
        fill={props.colorScale(19999999)}
        strokeWidth="1"
        stroke="black"
      />
      <rect
        x="66.4%"
        height="100"
        width="16.6%"
        fill={props.colorScale(99999999)}
        strokeWidth="1"
        stroke="black"
      />
      <rect
        x="83%"
        height="100"
        width="16.6%"
        fill={props.colorScale(9999999999)}
        strokeWidth="1"
        stroke="black"
      />
      <text
        x="1%"
        y="50%"
        fill="black"
        dominantBaseline="middle"
        textAnchor="start"
      >
        0 lbs.
      </text>
      <text
        x="17.7%"
        y="50%"
        fill="black"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {"<"} {rounded(Math.trunc(1000))} lbs.
      </text>
      <text
        x="34.3%"
        y="50%"
        fill="black"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {"<"} {rounded(Math.trunc(10000))} lbs.
      </text>
      <text
        x="50.9%"
        y="50%"
        fill="white"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {"<"} {rounded(Math.trunc(100000))} lbs.
      </text>
      <text
        x="67.5%"
        y="50%"
        fill="white"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {"<"} {rounded(Math.trunc(1000000))} lbs.
      </text>
      <text
        x="84.1%"
        y="50%"
        fill="white"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {">"} {rounded(Math.trunc(1000000))} lbs.
      </text>
    </svg>
  );
}

export default memo(ThematicMap);
