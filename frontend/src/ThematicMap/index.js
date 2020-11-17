import React, { memo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import "./index.css";

// used to produce more easily readable numbers
const rounded = (num) => {
  if (num > 1000000000) {
    return Math.round(num / 100000000) / 10 + "Bn";
  } else if (num > 1000000) {
    return Math.round(num / 100000) / 10 + "M";
  } else if (num > 1000) {
    return Math.round(num / 100) / 10 + "K";
  } else return num;
};

const thematicMap = (props) => {
  if (!props.data) return null;

  //change high end of color scale for US counties, as outliers always skew the data in this map
  var domain = [];
  var maxDomain =  (props.type === "counties" ? props.maxValue / 6 : props.maxValue)
  domain = [props.minValue, maxDomain];

  //returns a geography color based on the scale and given value
  const colorScale = scaleQuantile().domain(domain).range([
    //"#fef3f3",
    //"#feeceb",
    "#fee4e3",
    "#fddcdb",
    "#fdd5d3",
    "#fdc6c3",
    "#fcbebb",
    "#fcb6b3",
    "#fcafab",
    "#fca7a3",
    "#fba09c",
    "#fb9894",
    "#fb908c",
    "#fb8984",
    "#fb817c",
    "#fa7a74",
    "#fa726c",
    "#fa6a64",
    "#fa635c",
    "#f95b54",
    "#f9544c",
    "#f94c44",
    "#f9443c",
    "#f83d35",
    "#f82e25",
    "#f8352d",
    "#f8261d",
    "#f7170d",
    "#f51107",
    "#f71e15",
    "#ed1007",
    "#e51006",
    "#dd0f06",
    "#d50f06",
    "#cd0e06",
    "#c50e06",
    "#be0d05",
    "#b60c05",
    "#ae0c05",
    "#a60b05",
    "#9e0b04",
    "#960a04",
    "#8e0a04",
    "#860904",
    //"#7e0903",
    //"#760803",
    //"#6e0703",
    //"#660703",
    //"#5f0602",
    //"#570602",
    //"#4f0502",
    //"#470502",
    //"#3f0401",
    //"#370301",
    //"#2f0301",
    //"#1f0200",
    //"#270201",
  ]);

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
                        fill={colorScale(cur ? cur[filterType] : "#ECECEC")}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(null);
                          const { name, POP_EST } = geo.properties;
                          const total = cur.total;
                          props.setTooltipContent(`<h1><p style="text-align:center;">${name}</h1></p> <br /><span class="geography-attributes">
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
                    (s.facility__county).split(" ").[0].split(".")[0] ===
                      geo.properties.name.toUpperCase().split(" ").[0].split(".")[0]  &&
                      s.facility__state === geo.properties.iso_3166_2
                  );
                  if (cur !== undefined) {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScale(cur ? cur[filterType] : "#ECECEC")}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(null);
                          const { name, POP_EST } = geo.properties;
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
                          props.setTooltipContent("");
                        }}
                      />
                    );
                  } else {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={"#D3D3D3"}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(null);
                          const { name, POP_EST } = geo.properties;
                          props.setTooltipContent(`<h1><p style="text-align:center;">${name.toUpperCase()} COUNTY</p></h1><br />
                                             <span class="geography-attributes"> No data available at this time </span>
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
                      s.facility__county.split(" ").[0].split(".")[0] ===
                      geo.properties.NAME.toUpperCase().split(" ").[0].split(".")[0]
                  );
                  if (cur !== undefined) {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScale(cur ? cur[filterType] : "#ECECEC")}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(null);
                          const { NAME, POP_EST } = geo.properties;
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
                          props.setTooltipContent("");
                        }}
                      />
                    );
                  } else {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={"#D3D3D3"}
                        stroke={"#000"}
                        onMouseEnter={() => {
                          props.setTooltipContent(null);
                          const { NAME, POP_EST } = geo.properties;
                          props.setTooltipContent(`<h1><p style="text-align:center;">${NAME.toUpperCase()} COUNTY</p></h1><br />
                                         <span class="geography-attributes"> No data available at this time </span>
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
  }
};


// creates svg gradient legen based on min and max values and color scale
function Legend(props) {
  return (
    <svg height="25" width="100%" margin="5px">
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={props.colorScale(0)} stopOpacity="1" />
          <stop
            offset="100%"
            stopColor={props.colorScale(Number.MAX_SAFE_INTEGER)}
            stopOpacity="1"
          />
        </linearGradient>
        1
      </defs>
      <rect
        height="100"
        width="100%"
        fill="url(#grad2)"
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
        {rounded(Math.trunc(props.minVal))} lbs.
      </text>
      <text
        x="99%"
        y="50%"
        fill="white"
        dominantBaseline="middle"
        textAnchor="end"
      >
        {rounded(Math.trunc(props.maxVal))} lbs.
      </text>
    </svg>
  );
}

export default memo(thematicMap);
