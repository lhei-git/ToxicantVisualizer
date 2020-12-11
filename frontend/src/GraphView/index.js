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
const barAspectRatio = 12 / 9;
const timelineAspectRatio = 17 / 9;

// Cut off labels and add parentheses
const maxLabelLength = 20;

function handleError(err) {
  console.error(err);
  /* do something here */
}

/* compare function used for sorting timeline graphs */
const compare = (a, b) => {
  return a.year - b.year;
};

/* convert properties of graph to query params for the VET api */
const createParams = ({ map, filters }, customParams) => {
  const params = {
    city: map.city,
    county: map.county,
    state: map.state,
    carcinogen: filters.carcinogen,
    pbt: filters.pbt,
    release_type: filters.releaseType,
    chemical: filters.chemical,
    year: filters.year,
  };
  Object.assign(params, customParams);
  return { params };
};

const customYAxisTickFormatter = (val) => amountAsLabel(val) + " ";
const customLegendFormatter = (value) =>
  value.length > 35 ? value.slice(0, 35) + "..." : value;

/* Custom bar chart */
class CustomBarChart extends BarChart {
  static defaultProps = {
    ...BarChart.defaultProps,
    margin: {
      left: 20,
      bottom: 150,
    },
  };
}

/* Custom tooltip */
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

/* custom line */
class CustomLine extends Line {
  static defaultProps = {
    ...Line.defaultProps,
    type: "monotone",
    strokeWidth: 3,
    dot: false,
    activeDot: { r: 8 },
  };
}

/* Custom legend for timeline graphs */
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

/* Custom X axis for top ten graphs */
class CustomXAxis extends XAxis {
  static defaultProps = {
    ...XAxis.defaultProps,
    dataKey: "name",
    type: "category",
    interval: 0,
    tick: CustomXAxisTick,
  };
}

/* Custom X axis */
class CustomYAxis extends YAxis {
  static defaultProps = {
    ...YAxis.defaultProps,
    type: "number",
    unit: "lbs",
    width: 100,
    tickFormatter: customYAxisTickFormatter,
  };
}

/* take parsed timeline data and create a list of Recharts components */
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

/* 
take parsed top ten data and create a list of Recharts components.
when release type is not selected, bar graph is stacked (see stackId)
*/
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

/* Take parsed table data and generate html table */
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

/* Wrapper component around graphs. This is done to remove some of the boilerplate with handling the async fetch to the vet api.  */

/* TODO: use sessionStorage to store graph data for when filters do not change across tabs */
const GraphContainer = ({ graph, map, filters, title }) => {
  let [data, setData] = useState(null);

  /* Use graph's internal data fetching when filters change */
  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      if (!map) return;
      const g = await graph({ map, filters });
      if (mounted) setData(g);
    }
    fetchData();

    return () => (mounted = false);
  }, [graph, map, filters]);

  return (
    /* Graph must have received data successfully to render */
    graph !== null && (
      <div className="graph">
        <div className="graph-header">
          <Title text={title} map={map} filters={filters}></Title>
        </div>
        <div className="rechart">{data}</div>
      </div>
    )
  );
};
GraphContainer.propTypes = {
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
  title: PropTypes.string,
};

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
async function GraphTopTenFacilities({ map, filters }) {
  const { releaseType } = filters;
  try {
    const res = await vetapi.get(
      `/stats/location/facility_releases`,
      createParams({ map, filters })
    );
    const data = processBarGraphData(
      res.data,
      "facility__name",
      releaseType === "all"
    );
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <CustomBarChart data={data}>
            <CartesianGrid vertical={false} />
            <CustomXAxis></CustomXAxis>
            <CustomYAxis></CustomYAxis>
            <CustomTooltip></CustomTooltip>
            <Legend iconType="circle" align="right" verticalAlign="top" />
            {generateBars(releaseType)}
          </CustomBarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

async function GraphTopTenParents({ map, filters }) {
  const { releaseType } = filters;
  try {
    const res = await vetapi.get(
      `/stats/location/parent_releases`,
      createParams({ map, filters })
    );
    const data = processBarGraphData(
      res.data,
      "facility__parent_co_name",
      releaseType === "all"
    );
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <CustomBarChart data={data}>
            <CartesianGrid vertical={false} />
            <CustomXAxis></CustomXAxis>
            <CustomYAxis></CustomYAxis>
            <CustomTooltip></CustomTooltip>
            <Legend iconType="circle" align="right" verticalAlign="top" />
            {generateBars(releaseType)}
          </CustomBarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

/* Top ten chemicals bar graph */
async function GraphTopTenChemicals({ map, filters }) {
  const { releaseType } = filters;
  try {
    const res = await vetapi.get(
      `/stats/location/top_chemicals`,
      createParams({ map, filters })
    );
    const data = processBarGraphData(
      res.data,
      "chemical__name",
      releaseType === "all"
    );
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <CustomBarChart data={data}>
            <CartesianGrid vertical={false} />
            <CustomXAxis></CustomXAxis>
            <CustomYAxis></CustomYAxis>
            <CustomTooltip></CustomTooltip>
            <Legend iconType="circle" align="right" verticalAlign="top" />
            {generateBars(releaseType)}
          </CustomBarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

/* Top ten PBT chemicals bar graphs */
async function GraphTopTenPBTs({ map, filters }) {
  const { releaseType } = filters;

  try {
    const res = await vetapi.get(
      `/stats/location/top_chemicals`,
      createParams({ map, filters }, { chemical: null, pbt: true })
    );
    const data = processBarGraphData(
      res.data,
      "chemical__name",
      releaseType === "all"
    );
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <CustomBarChart data={data}>
            <CartesianGrid vertical={false} />
            <CustomXAxis></CustomXAxis>
            <CustomYAxis></CustomYAxis>
            <CustomTooltip></CustomTooltip>

            <Legend iconType="circle" align="right" verticalAlign="top" />
            {generateBars(releaseType)}
          </CustomBarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);

    return null;
  }
}

async function TimelineTotal({ map, filters }) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/total`,
      createParams({ map, filters }, { year: null })
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
async function TimelineTopFacilities({ map, filters }) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/facility_releases`,
      createParams({ map, filters }, { year: null })
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

async function TimelineTopParents({ map, filters }) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/parent_releases`,
      createParams({ map, filters }, { year: null })
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

async function TimelineTopChemicals({ map, filters }) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/top_chemicals`,
      createParams({ map, filters }, { chemical: null, year: null })
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

async function TimelineTopPBTs({ map, filters }) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/top_chemicals`,
      createParams({ map, filters }, { chemical: null, year: null, pbt: true })
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

//Chart 14 - Graph of all facilities and total releases in descending order
async function GraphAllFacilities({ map, filters }) {
  const { releaseType } = filters;
  try {
    const params = createParams({ map, filters }, { all: true });

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
async function GraphAllChemicals({ map, filters }) {
  const { releaseType } = filters;
  try {
    const params = createParams({ map, filters }, { all: true });

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

//Chart 12 - Table of all facilities and total releases
async function TableAllFacilities({ map, filters }) {
  try {
    const params = createParams(
      { map, filters },
      { all: true, release_type: null }
    );
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

async function TableAllChemicals({ map, filters }) {
  try {
    const params = createParams(
      { map, filters },
      { all: true, release_type: null }
    );
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

/* Wrapping component for graphs */
function GraphView({ map, filters, onFilterChange }) {
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
            map={map}
            filters={filters}
            onFilterChange={onFilterChange}
          ></Filters>
        </div>
        <div className="graphs">
          {currentTab === 0 && (
            <div className="top-tens">
              <GraphContainer
                map={map}
                filters={filters}
                graph={GraphTopTenFacilities}
                title="for top 10 facilities"
              ></GraphContainer>
              <GraphContainer
                map={map}
                filters={filters}
                graph={GraphTopTenParents}
                title="for top 10 parent companies"
              ></GraphContainer>
              <GraphContainer
                map={map}
                filters={filters}
                graph={GraphTopTenChemicals}
                title="for top 10 chemicals"
              ></GraphContainer>
              <GraphContainer
                map={map}
                filters={filters}
                graph={GraphTopTenPBTs}
                title="for top 10 PBT chemicals"
              ></GraphContainer>
            </div>
          )}
          {currentTab === 1 && (
            <div
              className="timelines"
              style={{ display: currentTab === 1 ? "block" : "none" }}
            >
              <GraphContainer
                map={map}
                filters={filters}
                graph={TimelineTotal}
                title=""
              ></GraphContainer>
              <GraphContainer
                map={map}
                filters={filters}
                graph={TimelineTopFacilities}
                title="for top 10 facilities"
              ></GraphContainer>
              <GraphContainer
                map={map}
                filters={filters}
                name="timeline_parents"
                graph={TimelineTopParents}
                title="for top 10 parent companies"
              ></GraphContainer>
              <GraphContainer
                map={map}
                filters={filters}
                graph={TimelineTopChemicals}
                title="for top 10 chemicals"
              ></GraphContainer>
              <GraphContainer
                map={map}
                filters={filters}
                graph={TimelineTopPBTs}
                title="for top 10 PBT chemicals"
              ></GraphContainer>
            </div>
          )}
          {currentTab === 2 && (
            <div
              className="indexes"
              style={{ display: currentTab === 2 ? "block" : "none" }}
            >
              <GraphContainer
                map={map}
                filters={filters}
                graph={GraphAllFacilities}
                title="for all facilities"
              ></GraphContainer>
              <GraphContainer
                map={map}
                filters={filters}
                graph={TableAllFacilities}
                title="for all facilities by release type"
              ></GraphContainer>
              <GraphContainer
                map={map}
                filters={filters}
                graph={GraphAllChemicals}
                title="for all chemicals"
              ></GraphContainer>
              <GraphContainer
                map={map}
                filters={filters}
                graph={TableAllChemicals}
                title="for all chemicals by release type"
              ></GraphContainer>
            </div>
          )}
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
