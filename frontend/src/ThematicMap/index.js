import React, { memo } from "react";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";

import { scaleQuantile } from "d3-scale";

//state map topo data
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers.json"

const rounded = num => {
  if (num > 1000000000) {
    return Math.round(num / 100000000) / 10 + "Bn";
  } else if (num > 1000000) {
    return Math.round(num / 100000) / 10 + "M";
  } else {
    return Math.round(num / 100) / 10 + "K";
  }
};

const thematicMap = (props) => {

const colorScale = scaleQuantile()
  .domain([props.minValue, props.maxValue])
  .range([
    "#fdcdcb",
    "#fcb6b3",
    "#fba09c",
    "#fb8984",
    "#fa726c",
    "#f95b54",
    "#f9443c",
    "#f82e25",
    "#f7170d",
    "#e51006",
    "#cd0e06",
    "#b60c05",
    "#9e0b04",
    "#860904",
    "#6e0703",
    "#570602",
    "#3f0401",

    // Alaska skews the results so bad that I had to add these
    // TODO: try to find a non-linear way to scale this data
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
    "#3f0401",
  ]);

  return (
    <>
      <ComposableMap data-tip="" projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              var cur = props.data.find(s => s.name === geo.properties.iso_3166_2);
              if( cur != undefined){
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorScale(cur ? cur.totalonsite : "#EEE")}
                  onMouseEnter={() => {
                    const { name, POP_EST } = geo.properties;
                    const total = cur.total;
                    props.setTooltipContent(`<h1><p style="text-align:center;">${name}</h1></p> <br />
                                                Total: ${Math.trunc(cur.totalonsite)} lbs. <br />
                                                Air: ${Math.trunc(cur.air)} lbs. <br />
                                                Water: ${Math.trunc(cur.water)} lbs. <br />
                                                Land: ${Math.trunc(cur.land)} lbs. <br />
                                                Offsite: ${Math.trunc(cur.totaloffsite)} lbs. <br />
                                                Dioxins: ${Math.trunc(cur.totaldioxin)} grams <br />
                                                Carcinogens: ${Math.trunc(cur.totalcarcs)} lbs. <br />
                                                Facilities: ${Math.trunc(cur.numtrifacilities)} <br />

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
  );
}


export default memo(thematicMap);
