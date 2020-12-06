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

  //determines if foreground text should be black or white depending on the darkness of the background color
  function textColorScale(color){
        var r = parseInt(color.toString().substr(1, 2), 16)
        var g = parseInt(color.toString().substr(3, 2), 16)
        var b = parseInt(color.toString().substr(5, 2), 16)

        return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ?
            "black" : "white";
  }

  //fetch color scale for visual elements based on release filter and map type (state vs. county)
  function colorScale(val, releaseType, mapType)
  {
    //color scales for each release type (on-site and total have the same color scale)
    const scaleAll = ["#FCDBC6", "#FBCBCA", "#F2A598", "#F65858", "#E00E0E", "#A60A0A"]
    const scaleAir = ["#DEDEDE", "#DDDDDD", "#AEAEAE", "#8D8D8D", "#6D6D6D", "#353535"]
    const scaleWater = ["#C5E0B4", "#97C14B", "#80B145", "#59954A", "#447741", "#316033"]
    const scaleLand = ["#F8CBAD", "#C48647", "#A3672B", "#844B11", "#733A00", "#502F0C"]
    const scaleOffsite = ["#FFFFCA", "#FFF9AE", "#F8ED62", "#E9D700", "#DAB600", "#A98600"]

    //numerical values to adjust the bucket size, values in each bucket are LESS THAN the numerical value
    const stateBuckets = [1000000, 10000000, 25000000, 50000000, 100000000]
    const countyBuckets = [1000, 10000, 100000, 1000000, 5000000]

    var valIndex = 0;

    //states and counties use a different scale to keep results presentable
    switch (mapType){
        case "states":
            if (val < stateBuckets[0]) valIndex = 0;
            else if (val < stateBuckets[1]) valIndex = 1;
            else if (val < stateBuckets[2]) valIndex = 2;
            else if (val < stateBuckets[3]) valIndex = 3;
            else if (val < stateBuckets[4]) valIndex = 4;
            else valIndex = 5;
            break;
        default:
            if (val < countyBuckets[0]) valIndex = 0;
            else if (val < countyBuckets[1]) valIndex = 1;
            else if (val < countyBuckets[2]) valIndex = 2;
            else if (val < countyBuckets[3]) valIndex = 3;
            else if (val < countyBuckets[4]) valIndex = 4;
            else valIndex = 5;
            break;
        }

    //return the color for the visual element
    switch (releaseType){
        case "air":
            return([scaleAir[valIndex]]);
        case "water":
            return([scaleWater[valIndex]]);
        case "land":
            return([scaleLand[valIndex]]);
        case "off_site":
            return([scaleOffsite[valIndex]]);
        default:
            return([scaleAll[valIndex]]);
    }
  }

  //zoom and pan functions for the county based thematic map
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

  //////  used to render the state based map  //////
  if (props.mapType === "states")
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
                        fill={colorScale(cur ? cur[props.filterType] : 0, props.filterType, props.mapType)}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(null);
                          props.setTooltipContent(`<h1><p style="text-align:center;">${
                            geo.properties.name
                          }</h1></p> <br /><span class="geography-attributes">
                                                Total: ${rounded(
                                                  Math.trunc(cur.total)
                                                )} lbs. <br />
                                                Land: ${rounded(
                                                  Math.trunc(cur.land)
                                                )} lbs. <br />
                                                Air: ${rounded(
                                                  Math.trunc(cur.air)
                                                )} lbs. <br />
                                                Water: ${rounded(
                                                  Math.trunc(cur.water)
                                                )} lbs. <br />
                                                Onsite: ${rounded(
                                                  Math.trunc(cur.on_site)
                                                )} lbs. <br />
                                                Offsite: ${rounded(
                                                  Math.trunc(cur.off_site)
                                                )} lbs. <br />
                                                Facilities: ${rounded(
                                                  Math.trunc(cur.num_facilities)
                                                )} <span />
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
            colorScale={colorScale}
            textColor={textColorScale}
            filterType={props.filterType}
            mapType={props.mapType}
          ></Legend>
        </div>
      </>
    );
  //////  used to render the county based map  //////
  else if (props.mapType === "counties")
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
                        s.facility__state === geo.properties.iso_3166_2 &&
                        s.facility__county.slice(0, geo.properties.name.length ) ===
                          geo.properties.name.toUpperCase()
                    );
                    if (cur !== undefined) {
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={colorScale(cur ? cur[props.filterType] : 0, props.filterType, props.mapType)}
                          stroke={"#000"}
                          onMouseEnter={() => {
                            props.setTooltipContent(null);
                            props.setTooltipContent(`<h1><p style="text-align:center;">${
                              cur.facility__county
                            } COUNTY</p></h1><span class="geography-attributes"><br />
                                                Total: ${rounded(
                                                  Math.trunc(cur.total)
                                                )} lbs. <br />
                                                Land: ${rounded(
                                                  Math.trunc(cur.land)
                                                )} lbs. <br />
                                                Air: ${rounded(
                                                  Math.trunc(cur.air)
                                                )} lbs. <br />
                                                Water: ${rounded(
                                                  Math.trunc(cur.water)
                                                )} lbs. <br />
                                                Onsite: ${rounded(
                                                  Math.trunc(cur.on_site)
                                                )} lbs. <br />
                                                Offsite: ${rounded(
                                                  Math.trunc(cur.off_site)
                                                )} lbs. <br />
                                                Facilities: ${rounded(
                                                  Math.trunc(cur.num_facilities)
                                                )} <span />
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
                          fill={colorScale(0, props.filterType, props.mapType)}
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
            colorScale={colorScale}
            textColor={textColorScale}
            filterType={props.filterType}
            mapType={props.mapType}
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
                        s.facility__county.slice(0, geo.properties.NAME.length ) ===
                          geo.properties.NAME.toUpperCase()
                  );
                  if (cur !== undefined) {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScale(cur ? cur[props.filterType] : 0, props.filterType, props.mapType)}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(`<h1><p style="text-align:center;">${
                            cur.facility__county
                          } COUNTY</p></h1><span class="geography-attributes"><br />
                                                Total: ${rounded(
                                                  Math.trunc(cur.total)
                                                )} lbs. <br />
                                                Land: ${rounded(
                                                  Math.trunc(cur.land)
                                                )} lbs. <br />
                                                Air: ${rounded(
                                                  Math.trunc(cur.air)
                                                )} lbs. <br />
                                                Water: ${rounded(
                                                  Math.trunc(cur.water)
                                                )} lbs. <br />
                                                Onsite: ${rounded(
                                                  Math.trunc(cur.on_site)
                                                )} lbs. <br />
                                                Offsite: ${rounded(
                                                  Math.trunc(cur.off_site)
                                                )} lbs. <br />
                                                Facilities: ${rounded(
                                                  Math.trunc(cur.num_facilities)
                                                )} <span />
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
                        fill={colorScale(0, props.filterType, props.mapType)}
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
            colorScale={colorScale}
            textColor={textColorScale}
            filterType={props.filterType}
          ></Legend>
        </div>
      </>
    );
  }
};

function Legend (props){
    //numerical values to adjust the bucket size, values in each bucket are GREATER THAN the numerical value
    //padded with a leading zero to create 6 buckets to iterate through to create visual elements
    const stateBuckets = [0, 1000000, 10000000, 25000000, 50000000, 100000000];
    const countyBuckets = [0, 1000, 10000, 100000, 1000000, 5000000];

    return(
        <svg height="25" width="100%" margin="5px">
            { stateBuckets.map((val, i) => {

                var currentColor = props.colorScale(props.mapType === "states" ? stateBuckets[i] + 1 : countyBuckets[i] + 1, props.filterType, props.mapType);

                return(
                  <>
                      <rect
                        height="100"
                        width="16.6%"
                        x = {(16.6 * i) + "%"}
                        fill={currentColor}
                        strokeWidth="1"
                        stroke="black"
                      />
                      <text
                        x={(16.6 * i) + 1 + "%"}
                        y="50%"
                        fill={ props.textColor(currentColor)}
                        dominantBaseline="middle"
                        textAnchor="start"
                      >
                        {i === 0 ? "≥" : ">"} {rounded(Math.trunc(
                            props.mapType === "states" ? stateBuckets[i]  : countyBuckets[i]
                        ))} lbs.
                  </text>
                  </>
                )

            })}
        </svg>
        );

};

export default memo(ThematicMap);
