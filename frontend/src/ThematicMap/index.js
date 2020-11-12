import React, { memo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import './index.css';

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

  //change the scale domain based on whether states or counties are being viewed
  //TODO: determine why minVal to maxVal doesn't work well as a domain, or see if there is a better scaling option
  var domain = [];
  if (props.type === "counties") domain = [1000, 1000000];
  else domain = [props.minValue * 2, props.maxValue / 2];

  //removes inconsistencies in county name, slow af
  //LEFT IN FOR PROTOTYPE 1 BECAUSE LOUSIANA STUCK OUT
  const fixCountyName = (name) => {
    var res = name.substring(name.length - 6, name.length);
    if (res.toUpperCase() === "PARISH")
      return name.substring(0, name.length - 7); //parish
    //else if (res.toUpperCase() === "S AREA") return name.substring(0, name.length -12)      //census area
    //else if (res.toUpperCase() === "PALITY") return name.substring(0, name.length -13)      //municipality

    //res = name.substring(name.length -9 , name.length);
    //if (res.toUpperCase() === " BOROUGH") alert( name.substring(0, name.length -13) )     //borough

    return name;
  };

  //returns a geography color based on the scale and given value
  const colorScale = scaleQuantile().domain(domain).range([
    "#fef3f3",
    "#feeceb",
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

  const filterType =
    props.filterType !== null ? props.filterType : "totalonsite";

  // used to render the state based map
  if (props.type === "states")
    return (
      <>
        <div className="thematic-map-container">
          <ComposableMap data-tip="" projection="geoAlbersUsa">
            <Geographies geography={props.geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  var cur = props.data.find(
                    (s) => s.name === geo.properties.iso_3166_2
                  );
                  if (cur !== undefined) {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScale(cur ? cur[filterType] : "#ECECEC")}
                        stroke={"#000"}
                        onMouseEnter={() => { props.setTooltipContent(null);
                          const { name, POP_EST } = geo.properties;
                          const total = cur.total;
                          props.setTooltipContent(`<h1><p style="text-align:center;">${name}</h1></p> <br /><span class="geography-attributes">
                                                Onsite: ${rounded(
                                                  Math.trunc(cur.totalonsite)
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
                                                  Math.trunc(cur.totaloffsite)
                                                )} lbs. <br />
                                                Total: ${rounded(
                                                  Math.trunc(cur.total)
                                                )} lbs. <br />
                                                Facilities: ${rounded(
                                                  Math.trunc(
                                                    cur.numtrifacilities
                                                  )
                                                )} </span>
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
          <Legend colorScale={colorScale} filterType={filterType} maxVal={props.maxValue} minVal={props.minValue}></Legend>
        </div>
      </>
    );
  //used to render the county based map
  else
    return (
      <>
        <div className="thematic-map-container">
          <ComposableMap data-tip="" projection="geoAlbersUsa">
            <Geographies geography={props.geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  var cur = props.data.find(
                    (s) =>
                      fixCountyName(s.county) ===
                        geo.properties.name.toUpperCase() &&
                      s.state === geo.properties.iso_3166_2
                  );
                  if (cur !== undefined) {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScale(cur ? cur.totalonsite : "#ECECEC")}
                        stroke={"#000"}
                        onMouseEnter={() => { props.setTooltipContent(null);
                          const { name, POP_EST } = geo.properties;
                          props.setTooltipContent(`<h1><p style="text-align:center;">${
                            cur.county
                          } COUNTY</p></h1><span class="geography-attributes"><br />
                                                Onsite: ${rounded(
                                                  Math.trunc(cur.totalonsite)
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
                                                  Math.trunc(cur.totaloffsite)
                                                )} lbs. <br />
                                                Total: ${rounded(
                                                  Math.trunc(cur.total)
                                                )} lbs. <br />
                                                Facilities: ${rounded(
                                                  Math.trunc(
                                                    cur.numtrifacilities
                                                  )
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
                        onMouseEnter={() => { props.setTooltipContent(null);
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
          <Legend colorScale={colorScale} filterType={filterType} maxVal={props.maxValue} minVal={props.minValue}></Legend>
        </div>
      </>
    );
};

function Legend(props)
{
    return(
        <svg height="25" width="100%" margin="5px">
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={props.colorScale(0)} stopOpacity="1" />
              <stop offset="100%" stopColor={props.colorScale(Number.MAX_SAFE_INTEGER)} stopOpacity="1" />
            </linearGradient>1
          </defs>
          <rect height="100" width="100%" fill="url(#grad2)" stroke-width="1" stroke="black" />
          <text x="3%" y="50%" fill="black" dominant-baseline="middle" text-anchor="start">{rounded(Math.trunc(props.minVal))}</text>
          <text x="97%" y="50%" fill="white" dominant-baseline="middle" text-anchor="end">{rounded(Math.trunc(props.maxVal))}</text>
        </svg>
    )
}

export default memo(thematicMap);
