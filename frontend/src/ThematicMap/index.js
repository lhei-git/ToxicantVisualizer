import React, { memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";

import { scaleQuantile } from "d3-scale";

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
  .domain([1000, 1000000])      //TODO: determine why minVal to maxVal doesn't work well as a range
  .range([
    //"#fef3f3",
    //"#feeceb",
    "#fee4e3",
    //"#fddcdb",
    //"#fdd5d3",
    "#fdc6c3",
    //"#fcbebb",
    //"#fcb6b3",
    "#fcafab",
    //"#fca7a3",
    //"#fba09c",
    "#fb9894",
    //"#fb908c",
    //"#fb8984",
    "#fb817c",
    //"#fa7a74",
    //"#fa726c",
    "#fa6a64",
    //"#fa635c",
    //"#f95b54",
    "#f9544c",
    //"#f94c44",
    //"#f9443c",
    "#f83d35",
    //"#f82e25",
    //"#f8352d",
    "#f8261d",
    //"#f7170d",
    //"#f51107",
    "#f71e15",
    //"#ed1007",
    //"#e51006",
    "#dd0f06",
    //"#d50f06",
    //"#cd0e06",
    "#c50e06",
    //"#be0d05",
    //"#b60c05",
    "#ae0c05",
    //"#a60b05",
    //"#9e0b04",
    "#960a04",
    //"#8e0a04",
    //"#860904",
    "#7e0903",
    //"#760803",
    //"#6e0703",
    "#660703",
    //"#5f0602",
    //"#570602",
    "#4f0502",
    //"#470502",
    //"#3f0401",
    "#370301",
    //"#2f0301",
    //"#1f0200",
    "#270201",
  ]);


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
)

else
return(
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
                  onMouseEnter={() => {
                    const { name, POP_EST } = geo.properties;
                    props.setTooltipContent(`${cur.county} — ${rounded(POP_EST)}`);
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
                    props.setTooltipContent(`${name} — ${rounded(POP_EST)}`);
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





//    <>
//      <ComposableMap projection="geoAlbersUsa">
//        <Geographies geography={props.geoUrl}>
//          {({ geographies }) =>
//            geographies.map(geo => {
//               var cur = props.data.find(s => s.county === geo.properties.name.toUpperCase() && s.state === geo.properties.state);
//
//              return (
//                 <Geography
//                  key={geo.rsmKey}
//                  geography={geo}
//                  fill={colorScale(cur ? cur.totalonsite : "#EEE")}
//                  onMouseEnter={() => {
//                    const { name, POP_EST } = geo.properties;
//
//                    props.setTooltipContent(`<h1><p style="text-align:center;">${name}</h1></p> <br />
//                                                Total: ${Math.trunc(cur.totalonsite)} lbs. <br />
//                                                Air: ${Math.trunc(cur.air)} lbs. <br />
//                                                Water: ${Math.trunc(cur.water)} lbs. <br />
//                                                Land: ${Math.trunc(cur.land)} lbs. <br />
//                                                Offsite: ${Math.trunc(cur.totaloffsite)} lbs. <br />
//                                                Dioxins: ${Math.trunc(cur.totaldioxin)} grams <br />
//                                                Carcinogens: ${Math.trunc(cur.totalcarcs)} lbs. <br />
//                                                Facilities: ${Math.trunc(cur.numtrifacilities)} <br />
//
//                                                `);
//                  }}
//                 onMouseLeave={() => {
//                    props.setTooltipContent("");
//                  }}
//                />
//              );
//            })
//          }
//        </Geographies>
//      </ComposableMap>
//    </>

//    <>
//    {alert(props.geoUrl)}
//      <ComposableMap data-tip="" projection="geoAlbersUsa">
//        <Geographies geography={props.geoUrl}>
//          {({ geographies }) =>
//            geographies.map(geo => {
//              var cur = props.data.find(s => s.county === geo.properties.name && s.state === geo.properties.state);
//              if( cur != undefined){
//              return (
//                <Geography
//                  key={geo.rsmKey}
//                  geography={geo}
//                  fill={colorScale(cur ? cur.totalonsite : "#EEE")}
//                  onMouseEnter={() => {
//                    const { name, POP_EST } = geo.properties;
//                    const total = cur.total;
//                    props.setTooltipContent(`<h1><p style="text-align:center;">${name}</h1></p> <br />
//                                                Total: ${Math.trunc(cur.totalonsite)} lbs. <br />
//                                                Air: ${Math.trunc(cur.air)} lbs. <br />
//                                                Water: ${Math.trunc(cur.water)} lbs. <br />
//                                                Land: ${Math.trunc(cur.land)} lbs. <br />
//                                                Offsite: ${Math.trunc(cur.totaloffsite)} lbs. <br />
//                                                Dioxins: ${Math.trunc(cur.totaldioxin)} grams <br />
//                                                Carcinogens: ${Math.trunc(cur.totalcarcs)} lbs. <br />
//                                                Facilities: ${Math.trunc(cur.numtrifacilities)} <br />
//
//                                                `);
//                  }}
//                 onMouseLeave={() => {
//                    props.setTooltipContent("");
//                  }}
//                />
//              );
//            }}
//            )
//          }
//        </Geographies>
//      </ComposableMap>
//    </>

}


export default memo(thematicMap);
