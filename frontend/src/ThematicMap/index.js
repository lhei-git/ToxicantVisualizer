import React, { memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";

import { scaleQuantile } from "d3-scale";

// used to produce more easily readable numbers
const rounded = num => {
  if (num > 1000000000) {
    return Math.round(num / 100000000) / 10 + "Bn";
  } else if (num > 1000000) {
    return Math.round(num / 100000) / 10 + "M";
  } else if (num > 1000) {
    return Math.round(num / 100) / 10 + "K";
  } else return num;
};

const thematicMap = (props) => {

if(!props.data) return null

//change the scale domain based on whether states or counties are being viewed
//TODO: determine why minVal to maxVal doesn't work well as a domain, or see if there is a better scaling option
var domain = [];
if (props.type == "counties")
    domain = [1000, 1000000]
else domain = [props.minValue, props.maxValue]

//returns a geography color based on the scale and given value
const colorScale = scaleQuantile()
  .domain(domain)
  .range([
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
    "#7e0903",
    "#760803",
    "#6e0703",
    "#660703",
    "#5f0602",
    "#570602",
    "#4f0502",
    "#470502",
    //"#3f0401",
    //"#370301",
    //"#2f0301",
    //"#1f0200",
    //"#270201",
  ]);

// used to render the state based map
if (props.type === "states")
  return (
    <>
      <ComposableMap data-tip="" projection="geoAlbersUsa">
        <Geographies geography={props.geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              var cur = props.data.find(s => s.name === geo.properties.iso_3166_2);
              if( cur != undefined){
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorScale(cur ? cur.totalonsite : "#EEE")}
                  stroke={"#000"}
                  onMouseEnter={() => {
                    const { name, POP_EST } = geo.properties;
                    const total = cur.total;
                    props.setTooltipContent(`<h1><p style="text-align:center;">${name}</h1></p> <br />
                                                Total: ${rounded(Math.trunc(cur.totalonsite))} lbs. <br />
                                                Air: ${rounded(Math.trunc(cur.air))} lbs. <br />
                                                Water: ${rounded(Math.trunc(cur.water))} lbs. <br />
                                                Land: ${rounded(Math.trunc(cur.land))} lbs. <br />
                                                Offsite: ${rounded(Math.trunc(cur.totaloffsite))} lbs. <br />
                                                Facilities: ${rounded(Math.trunc(cur.numtrifacilities))} <br />
                                                `);
                  }}
                 onMouseLeave={() => {
                    props.setTooltipContent("");
                  }}
                />
              );
            }}
            )
          }
        </Geographies>
      </ComposableMap>
    </>
)

//used to render the county based map
else return(
<>
<ComposableMap data-tip="" projection="geoAlbersUsa">
          <Geographies geography={props.geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
              var cur = props.data.find(s => (s.county === geo.properties.name.toUpperCase() && s.state === geo.properties.iso_3166_2));
              if(cur != undefined){
              return(
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorScale(cur ? cur.totalonsite : "#EEE")}
                  stroke={"#000"}
                  onMouseEnter={() => {
                    const { name, POP_EST } = geo.properties;
                    props.setTooltipContent(`<h1><p style="text-align:center;">${cur.county} COUNTY</p></h1><br />
                                                Total: ${rounded(Math.trunc(cur.totalonsite))} lbs. <br />
                                                Air: ${rounded(Math.trunc(cur.air))} lbs. <br />
                                                Water: ${rounded(Math.trunc(cur.water))} lbs. <br />
                                                Land: ${rounded(Math.trunc(cur.land))} lbs. <br />
                                                Offsite: ${rounded(Math.trunc(cur.totaloffsite))} lbs. <br />
                                                Facilities: ${rounded(Math.trunc(cur.numtrifacilities))} <br />
                    `);
                  }}
                  onMouseLeave={() => {
                    props.setTooltipContent("");
                  }}
                />)}
                else
                {
                return(
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    const { name, POP_EST } = geo.properties;
                    props.setTooltipContent(`<h1><p style="text-align:center;">${name.toUpperCase()} COUNTY</p></h1><br />
                                             No data available at this time
                    `);
                  }}
                  onMouseLeave={() => {
                    props.setTooltipContent("");
                  }}
                />)
                }
              })
            }
          </Geographies>
      </ComposableMap>
    </>
  )
}

export default memo(thematicMap);
