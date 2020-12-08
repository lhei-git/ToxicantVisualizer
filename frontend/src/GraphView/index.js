import "./index.css";
import React, { useEffect, useState } from "react";
import UserControlPanel from "../Filters";
const vetapi = require("../api/vetapi");
const { formatChemical, amountAsLabel, formatAmount } = require("../helpers");
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

function handleError(err) {
  /* do something here */
}

/* compare function used for sorting timeline graphs */
const compare = (a, b) => {
  return a.year - b.year;
};

/* convert properties of graph to query params for the VET api */
const createParams = (props, hideChemical, hideYear, forcePBT) => ({
  params: {
    city: props.map.city,
    county: props.map.county,
    state: props.map.state,
    carcinogen: props.filters.carcinogen,
    pbt: forcePBT ? true : props.filters.pbt,
    release_type: props.filters.releaseType,
    chemical: hideChemical ? null : props.filters.chemical,
    year: hideYear ? null : props.filters.year,
  },
});

/* Add css styling to base X-Axis React Component */
const CustomizedXAxisTick = (props) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        fontSize="12"
        transform="rotate(-35)"
        x={0}
        y={0}
        dx={-10}
        // fill="#FFF"
      >
        <tspan textAnchor="end" x="0" dy="0">
          {payload.value}
        </tspan>
      </text>
    </g>
  );
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

const compareIndividualTypes = (a, b) => {
  const aSum = a.av + a.bv + a.cv + a.dv;
  const bSum = b.av + b.bv + b.cv + b.dv;
  console.group();
  console.log(aSum, bSum, aSum - bSum);
  console.groupEnd();
  return bSum - aSum;
};

const processTopTenData = (data, nameAttribute, isStacked) => {
  let formatted = data
    .map((d) => {
      const f = d;
      return {
        name: f[nameAttribute],
        total: f.total,
        av: f.air || 0,
        bv: f.water || 0,
        cv: f.land || 0,
        dv: f.off_site || 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  if (isStacked) formatted.sort(compareIndividualTypes);

  /* Fill nearly empty bar chart with placeholders to avoid fatness */
  for (let i = formatted.length; i < 6; i++) {
    formatted.push({
      name: null,
    });
  }
  return formatted;
};

/* oh boy */
const processTimelineData = (data, nameAttribute) => {
  return data.lines
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
};

const timelineKeys = (data) => {
  const correctIndex = [...data].sort(
    (a, b) => Object.keys(b).length - Object.keys(a).length
  )[0];
  return Object.keys(correctIndex);
};

/* Top ten releasing facilities bar graph */
async function GraphTopTenFacilities(props) {
  const { releaseType } = props.filters;
  try {
    const res = await vetapi.get(
      `/stats/location/facility_releases`,
      createParams(props)
    );
    const data = processTopTenData(
      res.data,
      "facility__name",
      releaseType === "all"
    );
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <BarChart
            data={data}
            margin={{
              left: 50,
              right: 50,
              bottom: 250,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomizedXAxisTick />}
            />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{
                color: "#FFF",
                background: "rgba(0,0,0,0.8)",
                border: "none",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ fontSize: "24px", fontWeight: "bold" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend align="right" verticalAlign="top" />
            <Bar
              name="air"
              dataKey={releaseType === "air" ? "total" : "av"}
              stackId="a"
              legendType={
                ["air", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.air}
            />
            <Bar
              name="water"
              dataKey={releaseType === "water" ? "total" : "bv"}
              stackId="a"
              legendType={
                ["water", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.water}
            />
            <Bar
              name="land"
              dataKey={releaseType === "land" ? "total" : "cv"}
              stackId="a"
              legendType={
                ["land", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.land}
            />
            <Bar
              name="off-site"
              dataKey={releaseType === "off_site" ? "total" : "dv"}
              stackId="a"
              legendType={
                ["off_site", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.offSite}
            />
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
  try {
    const params = {
      city: props.map.city,
      county: props.map.county,
      state: props.map.state,
      year: props.filters.year,
      all: 1,
    };

    const res = await vetapi.get(`/stats/location/facility_releases`, {
      params,
    });
    const data = res.data
      .sort((a, b) => b.total - a.total)
      .map((d, i) => {
        const f = d;
        return {
          name: f.facility__name,
          av: f.air,
          bv: f.water,
          cv: f.land,
        };
      });
    return (
      <div
        width="100%"
        height="300px"
        style={{ overflowY: "auto", maxHeight: "500px" }}
      >
        <ResponsiveContainer
          width="100%"
          height={res.data.length * 50}
          minHeight="500px"
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              left: 200,
              right: 15,
              bottom: 50,
            }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomizedXAxisTick />}
              margin={{ top: 60 }}
            />
            <XAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => formatAmount(val) + " "}
            />
            <Tooltip
              contentStyle={{
                color: "#FFF",
                background: "rgba(0,0,0,0.8)",
                border: "none",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ fontSize: "24px", fontWeight: "bold" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend align="right" verticalAlign="top" />
            <Bar name="air" dataKey="av" stackId="a" fill="#8884d8" />
            <Bar name="water" dataKey="bv" stackId="a" fill="#82ca9d" />
            <Bar name="land" dataKey="cv" stackId="a" fill="#ffc658" />
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
      createParams(props, true, false, true)
    );
    const data = processTopTenData(res.data, "chemical__name");
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <BarChart
            data={data}
            margin={{
              left: 50,
              right: 50,
              bottom: 250,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomizedXAxisTick />}
            />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{
                color: "#FFF",
                background: "rgba(0,0,0,0.8)",
                border: "none",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ fontSize: "24px", fontWeight: "bold" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend align="right" verticalAlign="top" />
            <Bar
              name="air"
              dataKey={releaseType === "air" ? "total" : "av"}
              stackId="a"
              legendType={
                ["air", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.air}
            />
            <Bar
              name="water"
              dataKey={releaseType === "water" ? "total" : "bv"}
              stackId="a"
              legendType={
                ["water", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.water}
            />
            <Bar
              name="land"
              dataKey={releaseType === "land" ? "total" : "cv"}
              stackId="a"
              legendType={
                ["land", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.land}
            />
            <Bar
              name="on-site"
              dataKey={releaseType === "on_site" ? "total" : "dv"}
              stackId="a"
              legendType={
                ["on_site", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.onSite}
            />
            <Bar
              name="off-site"
              dataKey={releaseType === "off_site" ? "total" : "ev"}
              stackId="a"
              legendType={
                ["off_site", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.offSite}
            />
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
async function TableAllFacilities(props) {
  try {
    const params = {
      city: props.map.city,
      county: props.map.county,
      state: props.map.state,
      year: props.filters.year,
      all: 1,
    };
    const res = await vetapi.get(`/stats/location/facility_releases`, {
      params,
    });

    return (
      <div
        width="100%"
        height="50vh"
        style={{ overflowY: "scroll", maxHeight: "50vh" }}
      >
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
            {res.data.map(function (d, i) {
              if (i % 2 !== 0) {
                return (
                  <tr key={d + "-" + i}>
                    <td className="odd-overflow-column">{d.facility__name}</td>
                    <td className="odd-row">{d.land}</td>
                    <td className="odd-row">{d.air}</td>
                    <td className="odd-row">{d.water}</td>
                    <td className="odd-row">{d.vet_total_releases_offsite}</td>
                  </tr>
                );
              } else
                return (
                  <tr key={d + "-" + i}>
                    <td className="even-overflow-column">{d.facility__name}</td>
                    <td className="even-row">{d.land}</td>
                    <td className="even-row">{d.air}</td>
                    <td className="even-row">{d.water}</td>
                    <td className="even-row">{d.vet_total_releases_offsite}</td>
                  </tr>
                );
            })}
          </tbody>
        </table>
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
    const data = processTopTenData(res.data, "facility__parent_co_name", true);
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <BarChart
            data={data}
            margin={{
              left: 50,
              right: 50,
              bottom: 250,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomizedXAxisTick />}
            />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{
                color: "#FFF",
                background: "rgba(0,0,0,0.8)",
                border: "none",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ fontSize: "24px", fontWeight: "bold" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend align="right" verticalAlign="top" />
            <Bar
              name="air"
              dataKey={releaseType === "air" ? "total" : "av"}
              stackId="a"
              legendType={
                ["air", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.air}
            />
            <Bar
              name="water"
              dataKey={releaseType === "water" ? "total" : "bv"}
              stackId="a"
              legendType={
                ["water", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.water}
            />
            <Bar
              name="land"
              dataKey={releaseType === "land" ? "total" : "cv"}
              stackId="a"
              legendType={
                ["land", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.land}
            />
            <Bar
              name="on-site"
              dataKey={releaseType === "on_site" ? "total" : "dv"}
              stackId="a"
              legendType={
                ["on_site", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.onSite}
            />
            <Bar
              name="off-site"
              dataKey={releaseType === "off_site" ? "total" : "ev"}
              stackId="a"
              legendType={
                ["off_site", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.offSite}
            />
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
    const data = processTopTenData(res.data, "chemical__name");
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={barAspectRatio}>
          <BarChart
            data={data}
            margin={{
              left: 50,
              right: 50,
              bottom: 250,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomizedXAxisTick />}
            />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{
                color: "#FFF",
                background: "rgba(0,0,0,0.8)",
                border: "none",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ fontSize: "24px", fontWeight: "bold" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend align="right" verticalAlign="top" />
            <Bar
              name="air"
              dataKey={releaseType === "air" ? "total" : "av"}
              stackId="a"
              legendType={
                ["air", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.air}
            />
            <Bar
              name="water"
              dataKey={releaseType === "water" ? "total" : "bv"}
              stackId="a"
              legendType={
                ["water", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.water}
            />
            <Bar
              name="land"
              dataKey={releaseType === "land" ? "total" : "cv"}
              stackId="a"
              legendType={
                ["land", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.land}
            />
            <Bar
              name="on-site"
              dataKey={releaseType === "on_site" ? "total" : "dv"}
              stackId="a"
              legendType={
                ["on_site", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.onSite}
            />
            <Bar
              name="off-site"
              dataKey={releaseType === "off_site" ? "total" : "ev"}
              stackId="a"
              legendType={
                ["off_site", "all"].includes(releaseType) ? "square" : "none"
              }
              fill={barColors.offSite}
            />
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
      createParams(props, false, true)
    );
    const data = res.data;
    /* Fill total timeline with zeros, only needed if filtering by chemical and there is missing release data for one or more years */
    for (let i = 2005; i <= 2019; i++) {
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
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{
                color: "#FFF",
                background: "rgba(0,0,0,0.8)",
                border: "none",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ fontSize: "24px", fontWeight: "bold" }}
              isAnimationActive={false}
              itemSorter={(a) => -a.value}
              formatter={(value) => formatAmount(value)}
            />
            <Line
              type="monotone"
              name="total (lbs)"
              dataKey="total"
              stroke="#9c27b0"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 8 }}
            ></Line>
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
      createParams(props, false, true)
    );
    let data = processTimelineData(res.data, "facility__name");
    const keys = timelineKeys(data);
    const lines = keys
      .filter((k) => k !== "year")
      .map((k, i) => (
        <Line
          type="monotone"
          key={k}
          dataKey={k}
          stroke={timelineColors[i] || "#8884d8"}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 8 }}
        ></Line>
      ));
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={timelineAspectRatio}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{
                color: "#FFF",
                background: "rgba(0,0,0,0.8)",
                border: "none",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ fontSize: "24px", fontWeight: "bold" }}
              isAnimationActive={false}
              itemSorter={(a) => -a.value}
              formatter={(value) => formatAmount(value)}
            />
            <Legend
              width={120}
              height={140}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                whiteSpace: "nowrap",
                top: 0,
                right: 0,
                lineHeight: "24px",
              }}
            />
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
      createParams(props, false, true)
    );

    let data = processTimelineData(res.data, "facility__parent_co_name");
    const keys = timelineKeys(data);
    const lines = keys
      .filter((k) => k !== "year")
      .map((k, i) => (
        <Line
          type="monotone"
          key={k}
          dataKey={k}
          stroke={timelineColors[i] || "#8884d8"}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 8 }}
        ></Line>
      ));
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={timelineAspectRatio}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{
                color: "#FFF",
                background: "rgba(0,0,0,0.8)",
                border: "none",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ fontSize: "24px", fontWeight: "bold" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend
              width={120}
              height={140}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                whiteSpace: "nowrap",
                top: 0,
                right: 0,
                lineHeight: "24px",
              }}
            />
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
      createParams(props, true, true)
    );
    const data = res.data
      .reduce((acc, cur) => {
        const existing = acc.find((e) => e.year === cur.year);
        const formatted = formatChemical(cur["chemical__name"]).toUpperCase();
        if (existing) {
          existing[formatted] = cur.total;
        } else {
          const newLine = { year: cur.year, [formatted]: cur.total };
          acc.push(newLine);
        }
        return acc;
      }, [])
      .sort(compare);

    const keys = timelineKeys(data);
    const lines = keys
      .filter((k) => k !== "year")
      .map((k, i) => (
        <Line
          type="monotone"
          key={k}
          dataKey={k}
          stroke={timelineColors[i] || "#d9d9d9"}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 8 }}
        ></Line>
      ));
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={timelineAspectRatio}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{
                color: "#FFF",
                background: "rgba(0,0,0,0.8)",
                border: "none",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ fontSize: "24px", fontWeight: "bold" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend
              width={120}
              height={140}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                whiteSpace: "nowrap",
                top: 0,
                right: 0,
                lineHeight: "24px",
              }}
            />
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

async function timelineTopPBTs(props) {
  try {
    const res = await vetapi.get(
      `/stats/location/timeline/top_chemicals`,
      createParams(props, true, true, true)
    );
    const data = res.data
      .reduce((acc, cur) => {
        const existing = acc.find((e) => e.year === cur.year);
        const formatted = formatChemical(cur["chemical__name"]).toUpperCase();
        if (existing) {
          existing[formatted] = cur.total;
        } else {
          const newLine = { year: cur.year, [formatted]: cur.total };
          acc.push(newLine);
        }
        return acc;
      }, [])
      .sort(compare);

    const keys = timelineKeys(data);
    const lines = keys
      .filter((k) => k !== "year")
      .map((k, i) => (
        <Line
          type="monotone"
          key={k}
          dataKey={k}
          stroke={timelineColors[i] || "#d9d9d9"}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 8 }}
        ></Line>
      ));
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={timelineAspectRatio}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{
                color: "#FFF",
                background: "rgba(0,0,0,0.8)",
                border: "none",
              }}
              itemStyle={{ color: "#FFF" }}
              labelStyle={{ fontSize: "24px", fontWeight: "bold" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend
              width={120}
              height={140}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                whiteSpace: "nowrap",
                top: 0,
                right: 0,
                lineHeight: "24px",
              }}
            />
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

  function getLocationString(map) {
    let str = map.city
      ? map.city + ", "
      : map.county
      ? map.county + " County, "
      : "";
    str += map.state;
    return str;
  }

  /* format release type for title */
  function getReleaseTypeString(releaseType) {
    return releaseType !== "all" ? releaseType.replace("_", " ") : "";
  }

  /* Create formatted Title Component title given filter information */
  function Title(title, props, hasChemical) {
    return (
      <>
        Total {getReleaseTypeString(props.filters.releaseType) + " "}releases
        for <span>{title}</span> in {getLocationString(props.map)} in{" "}
        {props.filters.year}
        {hasChemical
          ? props.filters.chemical !== "all"
            ? " - " + props.filters.chemical
            : " - All chemicals"
          : null}
      </>
    );
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
            Indexes
          </li>
        </ul>
      </div>
      <div className="content">
        {/* <h1>Location Insights</h1> */}
        <div className="filter-container">
          <UserControlPanel
            map={props.map}
            filters={props.filters}
            onFilterChange={props.onFilterChange}
          ></UserControlPanel>
        </div>
        <div className="graphs">
          <div
            className="top-tens"
            style={{ display: currentTab === 0 ? "block" : "none" }}
          >
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="top_facilities"
              graph={GraphTopTenFacilities}
              title={Title("top 10 facilities", props, true)}
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="top_parents"
              graph={GraphTopTenParents}
              title={Title("top 10 parent companies", props, true)}
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="top_chemicals"
              graph={GraphTopTenChemicals}
              title={Title("top 10 chemicals", props)}
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="top_pbts"
              graph={GraphTopTenPBTs}
              title={Title("top 10 PBT chemicals", props)}
            ></GraphContainer>
          </div>
          <div
            className="timelines"
            style={{ display: currentTab === 1 ? "block" : "none" }}
          >
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="timeline_total"
              graph={TimelineTotal}
              title={
                <>
                  Total {getReleaseTypeString(props.filters.releaseType) + " "}
                  releases in {getLocationString(props.map)} in{" "}
                  {props.filters.year}
                  {props.filters.chemical !== "all"
                    ? " - " + props.filters.chemical
                    : " - All chemicals"}
                </>
              }
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="timeline_facilities"
              graph={TimelineTopFacilities}
              title={Title("top 10 facilities", props)}
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="timeline_parents"
              graph={TimelineTopParents}
              title={Title("top 10 parent companies", props)}
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="timeline_chemicals"
              graph={TimelineTopChemicals}
              title={Title("top 10 chemicals", props)}
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="timeline_chemicals"
              graph={timelineTopPBTs}
              title={Title("top 10 PBT chemicals", props)}
            ></GraphContainer>
          </div>
          <div
            className="indexes"
            style={{ display: currentTab === 2 ? "block" : "none" }}
          >
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="top_parents"
              graph={GraphAllFacilities}
              title="Total releases for all Facilities"
            ></GraphContainer>
            <GraphContainer
              map={props.map}
              filters={props.filters}
              name="top_parents"
              graph={TableAllFacilities}
              title="Total releases for all Facilities"
            ></GraphContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphView;
