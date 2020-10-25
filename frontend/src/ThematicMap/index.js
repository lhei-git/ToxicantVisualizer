import React, { memo } from "react";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";

import { scaleQuantize } from "d3-scale";

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

const thematicMap = ({ setTooltipContent }) => {

const colorScale = scaleQuantize()
  .domain([1, 10])
  .range([
    "#ffedea",
    "#ffcec5",
    "#ffad9f",
    "#ff8a75",
    "#ff5533",
    "#e2492d",
    "#be3d26",
    "#9a311f",
    "#782618"
  ]);

  return (
    <>
      <ComposableMap data-tip="" projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              const cur = 0; //data.find(s => s.id === geo.id);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorScale(cur ? cur.unemployment_rate : "#EEE")}
                  onMouseEnter={() => {
                    const { name, POP_EST } = geo.properties;
                    setTooltipContent(`${name} — ${rounded(POP_EST)}`);
                  }}
                 onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </>
  );


}
//  return (
//    <>
//      <ComposableMap data-tip="" projectionConfig={{ scale: 200 }}>
//        <ZoomableGroup>
//          <Geographies geography={geoUrl}>
//            {({ geographies }) =>
//              geographies.map(geo => (
//             // alert(geo.properties.name)
//                <Geography
//                  key={geo.rsmKey}
//                  geography={geo}
//                  onMouseEnter={() => {
//                    const { name, POP_EST } = geo.properties;
//                    setTooltipContent(`${name} — ${rounded(POP_EST)}`);
//                  }}
//                  onMouseLeave={() => {
//                    setTooltipContent("");
//                  }}
//                />
//              ))
//            }
//          </Geographies>
//        </ZoomableGroup>
//      </ComposableMap>
//    </>
//)
//};

export default memo(thematicMap);
