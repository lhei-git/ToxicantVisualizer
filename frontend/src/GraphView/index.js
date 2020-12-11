import "./index.css";
import React, { useEffect, useState } from "react";
import Filters from "../Filters";
import Title from "../Title";
import MapView from "../MapView";
import PropTypes from "prop-types";
const vetapi = require("../api/vetapi");
const { amountAsLabel, formatAmount } = require("../helpers");
const { years } = require("../contants");

const {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
} = require("recharts");

/* A bunch of random colors I found on some color generator */
const timelineColors = [
  "#a6cee3",
  "#1f78b4",
  "#b2df8a",
  "#33a02c",
  "#fb9a99",
  "#e31a1c",
  "#fdbf6f",
  "#ff7f00",
  "#cab2d6",
  "#6a3d9a",
];

/* The colors of the release types given to us by our client */
const barColors = {
  onSite: "#f65858",
  offSite: "#e9d700",
  air: "#8d8d8d",
  water: "#59954a",
  land: "#844b11",
};

/* Bar graph divs need to be taller than timeline graphs due to outrageous */
const barAspectRatio = 11 / 9;
const timelineAspectRatio = 17 / 9;

const maxLabelLength = 20;

const barChartMargins = {
  left: 20,
  right: 0,
  bottom: 150,
};

function handleError(err) {
  console.error(err);
  /* do something here */
}

/* compare function used for sorting timeline graphs */
const compare = (a, b) => {
  return a.year - b.year;
};

/* convert properties of graph to query params for the VET api */
const createParams = (props, customParams) => {
  const params = {
    city: props.map.city,
    county: props.map.county,
    state: props.map.state,
    carcinogen: props.filters.carcinogen,
    pbt: props.filters.pbt,
    release_type: props.filters.releaseType,
    chemical: props.filters.chemical,
    year: props.filters.year,
  };
  Object.assign(params, customParams);
  return { params };
};

const customYAxisTickFormatter = (val) => amountAsLabel(val) + " ";
const customLegendFormatter = (value) =>
  value.length > 35 ? value.slice(0, 35) + "..." : value;

class CustomTooltip extends Tooltip {
  static defaultProps = {
    ...Tooltip.defaultProps,
    contentStyle: {
      color: "#FFF",
      background: "rgba(0,0,0,0.8)",
      border: "none",
    },
    itemStyle: { color: "#FFF" },
    labelStyle: { fontSize: "24px", fontWeight: "bold" },
    isAnimationActive: false,
    formatter: (value) => formatAmount(value),
    itemSorter: (a) => -a.value,
  };
}

class CustomLine extends Line {
  static defaultProps = {
    ...Line.defaultProps,
    type: "monotone",
    strokeWidth: 3,
    dot: false,
    activeDot: { r: 8 },
  };
}

class CustomTimelineLegend extends Legend {
  static defaultProps = {
    ...Legend.defaultProps,
    width: 120,
    height: 140,
    layout: "vertical",
    verticalAlign: "middle",
    align: "right",
    wrapperStyle: {
      whiteSpace: "nowrap",
      top: 0,
      right: 0,
      lineHeight: "24px",
    },
    formatter: customLegendFormatter,
  };
}

/* Add css styling to base X-Axis React Component */
const CustomXAxisTick = (props) => {
  const { x, y, payload } = props;
  let { value } = payload;
  if (value.length > maxLabelLength + 5) {
    value = value.slice(0, maxLabelLength + 5) + "...";
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text fontSize="12" transform="rotate(-35)" x={0} y={0} dx={-10}>
        <tspan textAnchor="end" x="0" dy="0">
          {value}
        </tspan>
      </text>
    </g>
  );
};

/* Add css styling to base X-Axis React Component */
const CustomYAxisTick = (props) => {
  const { x, y, payload } = props;
  let { value } = payload;
  if (value.length > maxLabelLength) {
    value = value.slice(0, maxLabelLength) + "...";
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text fontSize="12" x={0} y={0} dx={10}>
        <tspan textAnchor="start" x="0" dy="0">
          {value}
        </tspan>
      </text>
    </g>
  );
};

class CustomXAxis extends XAxis {
  static defaultProps = {
    ...XAxis.defaultProps,
    dataKey: "name",
    type: "category",
    interval: 0,
    tick: CustomXAxisTick,
  };
}

class CustomYAxis extends YAxis {
  static defaultProps = {
    ...YAxis.defaultProps,
    type: "number",
    unit: "lbs",
    width: 100,
    tickFormatter: customYAxisTickFormatter,
  };
}

const generateLines = (data) => {
  const timelineKeys = (data) => {
    const correctIndex = [...data].sort(
      (a, b) => Object.keys(b).length - Object.keys(a).length
    )[0];
    return Object.keys(correctIndex);
  };

  if (data.length === 0) {
    return <></>;
  }

  const keys = timelineKeys(data);
  const lines = keys
    .filter((k) => k !== "year")
    .map((k, i) => (
      <CustomLine key={k} dataKey={k} stroke={timelineColors[i]}></CustomLine>
    ));
  return lines;
};

const generateBars = (currentReleaseType) => {
  const bars = [
    <Bar
      name="air"
      key="air"
      dataKey={currentReleaseType === "air" ? "total" : "av"}
      stackId="a"
      legendType={
        ["air", "all"].includes(currentReleaseType) ? "circle" : "none"
      }
      fill={barColors.air}
    />,
    <Bar
      name="water"
      key="water"
      dataKey={currentReleaseType === "water" ? "total" : "bv"}
      stackId="a"
      legendType={
        ["water", "all"].includes(currentReleaseType) ? "circle" : "none"
      }
      fill={barColors.water}
    />,
    <Bar
      name="land"
      key="land"
      dataKey={currentReleaseType === "land" ? "total" : "cv"}
      stackId="a"
      legendType={
        ["land", "all"].includes(currentReleaseType) ? "circle" : "none"
      }
      fill={barColors.land}
    />,
    <Bar
      name="off-site"
      key="off-site"
      dataKey={currentReleaseType === "off_site" ? "total" : "dv"}
      stackId="a"
      legendType={
        ["off_site", "all"].includes(currentReleaseType) ? "circle" : "none"
      }
      fill={barColors.offSite}
    />,
    <Bar
      name="on-site"
      key="on-site"
      dataKey={currentReleaseType === "on_site" ? "total" : "ev"}
      stackId="a"
      legendType={currentReleaseType === "on_site" ? "circle" : "none"}
      fill={barColors.onSite}
    />,
  ];
  return bars;
};

/* Wrapper component around graphs. This is done to remove some of the boilerplate with handling the async fetch to the vet api.  */
const GraphContainer = (props) => {
  let [graph, setGraph] = useState(null);

  /* This is done to avoid confusion with the props object across the rest of the function */
  let graphProp = props.graph;
  let mapProp = props.map;
  let filterProp = props.filters;

  let innerProps = {
    graph: graphProp,
    map: mapProp,
    filters: filterProp,
  };

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      if (!mapProp) return;
      const g = await graphProp(innerProps);
      if (mounted) setGraph(g);
    }
    fetchData();

    return () => (mounted = false);
  }, [graphProp, mapProp, filterProp]); /* eslint-disable-line */

  return (
    /* Graph must have received data successfully to render */
    graph !== null && (
      <div className="graph">
        <div className="graph-header">{props.title}</div>
        <div className="rechart">{graph}</div>
      </div>
    )
  );
};

/* The bar graphs appear in the following form: 
  {
    (facility|chemical|parent_co)__name: <>
    air: <>
    water: <>
    land: <>
    on_site: <>
    off_site: <>
  }

  This handles forming the data into a format Recharts.js can understand

*/

const processBarGraphData = (data, nameAttribute, isStacked) => {
  const compareIndividualTypes = (a, b) => {
    const aSum = a.av + a.bv + a.cv + a.dv;
    const bSum = b.av + b.bv + b.cv + b.dv;
    return bSum - aSum;
  };

  let formatted = data.map((d) => {
    const f = d;
    return {
      name: f[nameAttribute],
      total: isStacked ? null : f.total,
      av: f.air || 0,
      bv: f.water || 0,
      cv: f.land || 0,
      dv: f.off_site || 0,
    };
  });

  if (isStacked) formatted.sort(compareIndividualTypes);
  else formatted.sort((a, b) => b.total - a.total);

  /* Fill nearly empty bar chart with placeholders to avoid fatness */
  for (let i = formatted.length; i < 6; i++) {
    formatted.push({
      name: "",
    });
  }
  return formatted;
};

const fillTimeline = (data, nameAttribute) => {
  const newData = data;
  const names = new Set(data.map((d) => d[nameAttribute]));
  for (let year = years.start; year <= years.end; year++) {
    names.forEach((name) => {
      if (!newData.find((d) => d.year === year && d[nameAttribute] === name)) {
        newData.push({
          year,
          [nameAttribute]: name,
          total: 0,
        });
      }
    });
  }
  return newData;
};

/* oh boy */
const processTimelineData = (data, nameAttribute) => {
  data = fillTimeline(data, nameAttribute);
  const output = data
    .reduce((acc, cur) => {
      const existing = acc.find((e) => e.year === cur.year);
      const formatted = cur[nameAttribute];
      if (existing) {
        existing[formatted] = cur.total;
      } else {
        const newLine = { year: cur.year, [formatted]: cur.total };
        acc.push(newLine);
      }
      return acc;
    }, [])
    .sort(compare);
  return output;
};

/* Top ten releasing facilities bar graph */
async function GraphTopTenFacilities(props) {
  const { releaseType } = props.filters;
  try {
    const res = await vetapi.get(
      `/stats/location/facility_releases`,
      createParams(props)
    );
    const data = processBarGraphData(
      res.data,
      "facility__name",
      releaseType === "all"
    );
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <BarChart data={data} margin={barChartMargins}>
            <CartesianGrid vertical={false} />
            <CustomXAxis></CustomXAxis>
            <CustomYAxis></CustomYAxis>
            <CustomTooltip></CustomTooltip>
            <Legend iconType="circle" align="right" verticalAlign="top" />
            {generateBars(releaseType)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

//Chart 14 - Graph of all facilities and total releases in descending order
async function GraphAllFacilities(props) {
  const { releaseType } = props.filters;
  try {
    const params = createParams(props, { all: true });

    const res = await vetapi.get(`/stats/location/facility_releases`, params);
    const data = processBarGraphData(
      res.data,
      "facility__name",
      releaseType === "all"
    );
    return (
      <div
        width="100%"
        height="300px"
        style={{ overflowY: "auto", maxHeight: "500px" }}
      >
        <ResponsiveContainer
          width="100%"
          height={Math.max(res.data.length * 50, 500)}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              // left: 150,
              right: 150,
              bottom: 50,
              // top: 40,
            }}
          >
            <CartesianGrid />
            <Legend iconType="circle" align="right" verticalAlign="top" />
            <XAxis
              // hide="true"
              orientation="top"
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => formatAmount(val) + " "}
            />
            <YAxis
              dataKey="name"
              type="category"
              interval={0}
              orientation="right"
              tick={<CustomYAxisTick />}
            />
            <CustomTooltip></CustomTooltip>
            {generateBars(releaseType)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

//Chart 14 - Graph of all facilities and total releases in descending order
async function GraphAllChemicals(props) {
  const { releaseType } = props.filters;
  try {
    const params = createParams(props, { all: true });

    const res = await vetapi.get(`/stats/location/top_chemicals`, params);
    const data = processBarGraphData(
      res.data,
      "chemical__name",
      releaseType === "all"
    );
    return (
      <div
        width="100%"
        height="300px"
        style={{ overflowY: "auto", maxHeight: "500px" }}
      >
        <ResponsiveContainer
          width="100%"
          height={Math.max(res.data.length * 50, 500)}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              // left: 150,
              right: 150,
              bottom: 50,
              // top: 40,
            }}
          >
            <CartesianGrid />
            <Legend iconType="circle" align="right" verticalAlign="top" />
            <XAxis
              // hide="true"
              orientation="top"
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => formatAmount(val) + " "}
            />
            <YAxis
              dataKey="name"
              type="category"
              interval={0}
              orientation="right"
              tick={<CustomYAxisTick />}
            />
            <CustomTooltip></CustomTooltip>
            {generateBars(releaseType)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

const generateTable = (data, nameAttribute) => {
  return (
    <table className="dynamic-table">
      <thead>
        <tr>
          <th className="sticky-header">Facility Name</th>
          <th className="sticky-header">Land</th>
          <th className="sticky-header">Air</th>
          <th className="sticky-header">Water</th>
          <th className="sticky-header">Off-Site</th>
        </tr>
      </thead>
      <tbody>
        {data.map(function (d, i) {
          if (i % 2 !== 0) {
            return (
              <tr key={d + "-" + i}>
                <td className="odd-overflow-column">{d[nameAttribute]}</td>
                <td className="odd-row">{d.land}</td>
                <td className="odd-row">{d.air}</td>
                <td className="odd-row">{d.water}</td>
                <td className="odd-row">{d.off_site}</td>
              </tr>
            );
          } else
            return (
              <tr key={d + "-" + i}>
                <td className="even-overflow-column">{d[nameAttribute]}</td>
                <td className="even-row">{d.land}</td>
                <td className="even-row">{d.air}</td>
                <td className="even-row">{d.water}</td>
                <td className="even-row">{d.off_site}</td>
              </tr>
            );
        })}
      </tbody>
    </table>
  );
};

//Chart 12 - Table of all facilities and total releases
async function TableAllFacilities(props) {
  try {
    const params = createParams(props, { all: true, release_type: null });
    const { data } = await vetapi.get(
      `/stats/location/facility_releases`,
      params
    );
    return (
      <div
        width="100%"
        height="50vh"
        style={{ overflowY: "auto", maxHeight: "50vh" }}
      >
        {generateTable(data, "facility__name")}
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

async function TableAllChemicals(props) {
  try {
    const params = createParams(props, { all: true, release_type: null });
    const { data } = await vetapi.get(`/stats/location/top_chemicals`, params);
    return (
      <div
        width="100%"
        height="50vh"
        style={{ overflowY: "auto", maxHeight: "50vh" }}
      >
        {generateTable(data, "chemical__name")}
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

async function GraphTopTenParents(props) {
  const { releaseType } = props.filters;
  try {
    const res = await vetapi.get(
      `/stats/location/parent_releases`,
      createParams(props)
    );
    const data = processBarGraphData(
      res.data,
      "facility__parent_co_name",
      releaseType === "all"
    );
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <BarChart data={data} margin={barChartMargins}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomXAxisTick />}
            />
            <CustomYAxis></CustomYAxis>

            <CustomTooltip></CustomTooltip>

            <Legend iconType="circle" align="right" verticalAlign="top" />
            {generateBars(releaseType)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

/* Top ten chemicals bar graph */
async function GraphTopTenChemicals(props) {
  const { releaseType } = props.filters;
  try {
    const res = await vetapi.get(
      `/stats/location/top_chemicals`,
      createParams(props)
    );
    const data = processBarGraphData(
      res.data,
      "chemical__name",
      releaseType === "all"
    );
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <BarChart data={data} margin={barChartMargins}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomXAxisTick />}
            />
            <CustomYAxis></CustomYAxis>
            <CustomTooltip></CustomTooltip>
            <Legend iconType="circle" align="right" verticalAlign="top" />
            {generateBars(releaseType)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

/* Top ten PBT chemicals bar graphs */
async function GraphTopTenPBTs(props) {
  const { releaseType } = props.filters;

  try {
    const res = await vetapi.get(
      `/stats/location/top_chemicals`,
      createParams(props, { chemical: null, pbt: true })
    );
    const data = processBarGraphData(
      res.data,
      "chemical__name",
      releaseType === "all"
    );
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <BarChart data={data} margin={barChartMargins}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomXAxisTick />}
            />
            <CustomYAxis></CustomYAxis>

            <CustomTooltip></CustomTooltip>

            <Legend iconType="circle" align="right" verticalAlign="top" />
            {generateBars(releaseType)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

async function TimelineTotal(props) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/total`,
      createParams(props, { year: null })
    );
    const data = res.data;
    /* Fill total timeline with zeros, only needed if filtering by chemical and there is missing release data for one or more years */
    for (let i = years.start; i <= years.end; i++) {
      if (!data.find((d) => d.year === i)) {
        data.push({
          year: i,
          total: 0,
        });
      }
    }
    data.sort((a, b) => a.year - b.year);
    const body = (
      <div>
        <ResponsiveContainer width="100%" aspect={timelineAspectRatio}>
          <LineChart data={data} margin={{ right: 150 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <CustomYAxis></CustomYAxis>

            <CustomTooltip></CustomTooltip>
            <CustomLine
              name="total (lbs)"
              dataKey="total"
              stroke="#9c27b0"
            ></CustomLine>
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
    return body;
  } catch (err) {
    handleError(err);
    return null;
  }
}

/* Top ten facilities over time line chart */
async function TimelineTopFacilities(props) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/facility_releases`,
      createParams(props, { year: null })
    );
    let data = processTimelineData(res.data, "facility__name");
    const lines = generateLines(data);
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={timelineAspectRatio}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <CustomYAxis></CustomYAxis>
            <CustomTooltip></CustomTooltip>
            <CustomTimelineLegend></CustomTimelineLegend>
            {lines}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

async function TimelineTopParents(props) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/parent_releases`,
      createParams(props, { year: null })
    );

    let data = processTimelineData(res.data, "facility__parent_co_name");
    const lines = generateLines(data);

    return (
      <div>
        <ResponsiveContainer width="100%" aspect={timelineAspectRatio}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <CustomYAxis></CustomYAxis>

            <CustomTooltip></CustomTooltip>
            <CustomTimelineLegend></CustomTimelineLegend>

            {lines}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

async function TimelineTopChemicals(props) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/top_chemicals`,
      createParams(props, { chemical: null, year: null })
    );
    let data = processTimelineData(res.data, "chemical__name");
    const lines = generateLines(data);

    return (
      <div>
        <ResponsiveContainer width="100%" aspect={timelineAspectRatio}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <CustomYAxis></CustomYAxis>

            <CustomTooltip></CustomTooltip>
            <CustomTimelineLegend></CustomTimelineLegend>

            {lines}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);
    return null;
  }
}

async function TimelineTopPBTs(props) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/top_chemicals`,
      createParams(props, { chemical: null, year: null, pbt: true })
    );
    let data = processTimelineData(res.data, "chemical__name");
    const lines = generateLines(data);

    return (
      <div>
        <ResponsiveContainer width="100%" aspect={timelineAspectRatio}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <CustomYAxis></CustomYAxis>
            <CustomTooltip></CustomTooltip>
            <CustomTimelineLegend></CustomTimelineLegend>
            {lines}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);
    return null;
  }
}

/* Wrapping component for graphs */
function GraphView(props) {
  const [currentTab, setCurrentTab] = React.useState(
    /* Stores which tab user was last on. Might be worth taking out */
    parseInt(sessionStorage.getItem("currentTab")) || 0
  );

  /* Setter for current tab */
  function chooseTab(i) {
    sessionStorage.setItem("currentTab", i);
    setCurrentTab(i);
  }

  return (
    <div className="graph-container">
      <div className="selector">
        <ul>
          <li
            onClick={() => chooseTab(0)}
            className={currentTab === 0 ? "active" : ""}
          >
            Top Tens
          </li>
          <li
            onClick={() => chooseTab(1)}
            className={currentTab === 1 ? "active" : ""}
          >
            Timelines
          </li>
          <li
            onClick={() => chooseTab(2)}
            className={currentTab === 2 ? "active" : ""}
          >
            Appendix
          </li>
        </ul>
      </div>
      <div className="content">
        {/* <h1>Location Insights</h1> */}
        <div className="filter-container">
          <Filters
            map={props.map}
            filters={props.filters}
            onFilterChange={props.onFilterChange}
          ></Filters>
        </div>
        <div className="graphs">
          <div
            className="top-tens"
            style={{ display: currentTab === 0 ? "block" : "none" }}
          >
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={GraphTopTenFacilities}
              title={
                <Title
                  text="for top 10 facilities"
                  map={props.map}
                  filters={props.filters}
                ></Title>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={GraphTopTenParents}
              title={
                <Title
                  text="for top 10 parent companies"
                  map={props.map}
                  filters={props.filters}
                ></Title>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={GraphTopTenChemicals}
              title={
                <Title
                  text="for top 10 chemicals"
                  map={props.map}
                  filters={props.filters}
                  showChemicalName={false}
                ></Title>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={GraphTopTenPBTs}
              title={
                <Title
                  text="for top 10 PBT chemicals"
                  map={props.map}
                  filters={props.filters}
                  showChemicalName={false}
                ></Title>
              }
            ></GraphContainer>
          </div>
          <div
            className="timelines"
            style={{ display: currentTab === 1 ? "block" : "none" }}
          >
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={TimelineTotal}
              title={
                <Title
                  text=""
                  map={props.map}
                  filters={props.filters}
                  showYear={false}
                ></Title>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={TimelineTopFacilities}
              title={
                <Title
                  text="for top 10 facilities"
                  map={props.map}
                  filters={props.filters}
                  showYear={false}
                ></Title>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="timeline_parents"
              graph={TimelineTopParents}
              title={
                <Title
                  text="for top 10 parent companies"
                  map={props.map}
                  filters={props.filters}
                  showYear={false}
                ></Title>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={TimelineTopChemicals}
              title={
                <Title
                  text="for top 10 chemicals"
                  map={props.map}
                  filters={props.filters}
                  showYear={false}
                  showChemicalName={false}
                ></Title>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={TimelineTopPBTs}
              title={
                <Title
                  text="for top 10 PBT chemicals"
                  map={props.map}
                  filters={props.filters}
                  showYear={false}
                  showChemicalName={false}
                ></Title>
              }
            ></GraphContainer>
          </div>
          <div
            className="indexes"
            style={{ display: currentTab === 2 ? "block" : "none" }}
          >
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={GraphAllFacilities}
              title={
                <Title
                  text="for all facilities"
                  map={props.map}
                  filters={props.filters}
                ></Title>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={TableAllFacilities}
              title={
                <Title
                  text="for all facilities by release type"
                  map={props.map}
                  filters={props.filters}
                  showReleaseType={false}
                ></Title>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={GraphAllChemicals}
              title={
                <Title
                  text="for all chemicals"
                  map={props.map}
                  filters={props.filters}
                  showChemicalName={false}
                ></Title>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              graph={TableAllChemicals}
              title={
                <Title
                  text="for all chemicals by release type"
                  map={props.map}
                  filters={props.filters}
                  showReleaseType={false}
                  showChemicalName={false}
                ></Title>
              }
            ></GraphContainer>
          </div>
        </div>
      </div>
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

export default GraphView;
