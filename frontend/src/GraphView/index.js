import "./index.css";
import React, { Component, useEffect, useState } from "react";
import UserControlPanel from "../UserControlPanel";
import GraphSummary from "../Graphs/Summary";
import TimelineTotal from "../Graphs/TimelineTotal";
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
  LabelList,
  ResponsiveContainer,
} = require("recharts");

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

const barColors = {
  red: "#ff483a",
  beige: "#ffc684",
  blue: "#15607a",
  grey: "#e7e7e7",
  purple: "#9c27b0",
};

function handleError(err) {
  /* do something here */
}

function CustomizedXAxisTick(props) {
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
}

function GraphContainer(props) {
  let [graph, setGraph] = useState(null);
  let graphProp = props.graph;
  let viewportProp = props.viewport;
  let filterProp = props.filters;

  let innerProps = {
    graph: graphProp,
    viewport: viewportProp,
    filters: filterProp,
  };

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      if (!viewportProp) return;
      const g = await graphProp(innerProps);
      if (mounted) setGraph(g);
    }
    fetchData();

    return () => (mounted = false);
  }, [graphProp, viewportProp, filterProp]); /* eslint-disable-line */

  return (
    graph !== null && (
      <div className="graph">
        <div className="header">{props.title}</div>
        <div className="rechart">{graph}</div>
      </div>
    )
  );
}

async function GraphTopTenFacilities(props) {
  try {
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      carcinogen: props.filters.carcinogens || null,
      dioxin: props.filters.pbtsAndDioxins || null,
      pbt: props.filters.pbtsAndDioxins || null,
      release_type: props.filters.releaseType,
      year: props.filters.year,
    };
    const res = await vetapi.get(`/stats/location/facility_releases`, {
      params,
    });
    const data = res.data
      .map((d) => {
        const f = d;
        return {
          name: f.facility__name,
          total: f.total,
          av: f.air,
          bv: f.water,
          cv: f.land,
          dv: f.off_site,
        };
      })
      .sort((a, b) => b.total - a.total);
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={16 / 9}>
          <BarChart
            data={data}
            margin={{
              top: 30,
              // right: 50,
              left: 50,
              bottom: 200,
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
              contentStyle={{ color: "#000" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend align="right" verticalAlign="top" />
            <Bar name="air" dataKey="av" stackId="a" fill={barColors.red} />
            <Bar name="water" dataKey="bv" stackId="a" fill={barColors.blue} />
            <Bar name="land" dataKey="cv" stackId="a" fill={barColors.beige} />
            <Bar
              name="off-site"
              dataKey="dv"
              stackId="a"
              fill={barColors.grey}
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
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      carcinogen: props.filters.carcinogens || null,
      dioxin: props.filters.pbtsAndDioxins || null,
      pbt: props.filters.pbtsAndDioxins || null,
      release_type: props.filters.releaseType,
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
        height="180px"
        style={{ "overflow-y": "scroll", "max-height": "400px" }}
      >
        <ResponsiveContainer width="100%" height={res.data.length * 40}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 30,
              // right: 50,
              left: 50,
              bottom: 200,
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
              contentStyle={{ color: "#000" }}
              isAnimationActive={false}
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

//Chart 12 - Table of all facilities and total releases
async function TableAllFacilities(props) {
  try {
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      carcinogen: props.filters.carcinogens || null,
      dioxin: props.filters.pbtsAndDioxins || null,
      pbt: props.filters.pbtsAndDioxins || null,
      release_type: props.filters.releaseType,
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
        height="50vh"
        style={{ "overflow-y": "scroll", "max-height": "50vh" }}
      >
        <table class="dynamic-table">
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
              if (i % 2 != 0) {
                return (
                  <tr>
                    <td className="odd-overflow-column">{d.facility__name}</td>
                    <td className="odd-row">{d.land}</td>
                    <td className="odd-row">{d.air}</td>
                    <td className="odd-row">{d.water}</td>
                    <td className="odd-row">{d.vet_total_releases_offsite}</td>
                  </tr>
                );
              } else
                return (
                  <tr>
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
  try {
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      carcinogen: props.filters.carcinogens || null,
      dioxin: props.filters.pbtsAndDioxins || null,
      pbt: props.filters.pbtsAndDioxins || null,
      release_type: props.filters.releaseType,
      year: props.filters.year,
    };
    const res = await vetapi.get(`/stats/location/parent_releases`, {
      params,
    });
    const data = res.data
      .map((d) => {
        const f = d;
        return {
          name: f.facility__parent_co_name,
          total: f.total,
          av: f.air,
          bv: f.water,
          cv: f.land,
          dv: f.off_site,
        };
      })
      .sort((a, b) => b.total - a.total);
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={16 / 9}>
          <BarChart
            data={data}
            // layout="vertical"
            margin={{
              top: 30,
              // right: 50,
              left: 50,
              bottom: 200,
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
              contentStyle={{ color: "#000" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend align="right" verticalAlign="top" />
            <Bar name="air" dataKey="av" stackId="a" fill={barColors.red} />
            <Bar name="water" dataKey="bv" stackId="a" fill={barColors.blue} />
            <Bar name="land" dataKey="cv" stackId="a" fill={barColors.beige} />
            <Bar
              name="off-site"
              dataKey="dv"
              stackId="a"
              fill={barColors.grey}
            />
            <Bar
              name="off-site"
              dataKey="dv"
              stackId="a"
              fill={barColors.grey}
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

async function GraphTopTenChemicals(props) {
  try {
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      carcinogen: props.filters.carcinogens || null,
      dioxin: props.filters.pbtsAndDioxins || null,
      pbt: props.filters.pbtsAndDioxins || null,
      release_type: props.filters.releaseType,
      year: props.filters.year,
    };
    const res = await vetapi.get(`/stats/location/top_chemicals`, { params });
    const data = res.data
      .map((d, i) => {
        return {
          name: formatChemical(d.chemical__name),
          pv: d.total,
        };
      })
      .sort((a, b) => b.pv - a.pv);
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={16 / 9}>
          <BarChart
            data={data}
            margin={{
              top: 30,
              left: 50,
              bottom: 100,
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
              contentStyle={{ color: "#000" }}
              isAnimationActive={false}
              formatter={(value) => formatAmount(value)}
              itemSorter={(a) => -a.value}
            />
            <Legend align="right" verticalAlign="top" />
            <Bar
              name="release amount (lbs)"
              dataKey="pv"
              stackId="a"
              fill={barColors.purple}
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

async function TimelineTopFacilities(props) {
  try {
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      carcinogen: props.filters.carcinogens || null,
      dioxin: props.filters.pbtsAndDioxins || null,
      pbt: props.filters.pbtsAndDioxins || null,
      release_type: props.filters.releaseType,
      averages: true,
    };
    const res = await vetapi.get(`/stats/location/timeline/facility_releases`, {
      params,
    });

    const data = res.data.lines
      .reduce((acc, cur) => {
        const existing = acc.find((e) => e.year === cur.year);
        const formatted = cur["facility__name"];
        if (existing) {
          existing[formatted] = cur.total;
        } else {
          const newLine = { year: cur.year, [formatted]: cur.total };
          acc.push(newLine);
        }
        return acc;
      }, [])
      .sort((a, b) => a.year - b.year);
    const keys = Object.keys(data[0]);
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
        <ResponsiveContainer width="100%" aspect={16 / 7}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 50,
              // left: 50,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{ color: "#000" }}
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
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      carcinogen: props.filters.carcinogens || null,
      dioxin: props.filters.pbtsAndDioxins || null,
      pbt: props.filters.pbtsAndDioxins || null,
      release_type: props.filters.releaseType,
    };
    const res = await vetapi.get(`/stats/location/timeline/parent_releases`, {
      params,
    });
    const data = res.data
      .reduce((acc, cur) => {
        const existing = acc.find((e) => e.year === cur.year);
        const formatted = cur["facility__parent_co_name"];
        if (existing) {
          existing[formatted] = cur.total;
        } else {
          const newLine = { year: cur.year, [formatted]: cur.total };
          acc.push(newLine);
        }
        return acc;
      }, [])
      .sort((a, b) => a.year - b.year);

    const keys = Object.keys(data[0]);
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
        <ResponsiveContainer width="100%" aspect={16 / 7}>
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 50,
              // left: 50,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{ color: "#000" }}
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
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      carcinogen: props.filters.carcinogens || null,
      dioxin: props.filters.pbtsAndDioxins || null,
      pbt: props.filters.pbtsAndDioxins || null,
      release_type: props.filters.releaseType,
    };
    const res = await vetapi.get(`/stats/location/timeline/top_chemicals`, {
      params,
    });
    const data = res.data.reduce((acc, cur) => {
      const existing = acc.find((e) => e.year === cur.year);
      const formatted = formatChemical(cur["chemical__name"]).toUpperCase();
      if (existing) {
        existing[formatted] = cur.total;
      } else {
        const newLine = { year: cur.year, [formatted]: cur.total };
        acc.push(newLine);
      }
      return acc;
    }, []);

    const keys = Object.keys(data[0]);
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
        <ResponsiveContainer width="100%" aspect={16 / 7}>
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 50,
              // left: 50,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => amountAsLabel(val) + " "}
            />
            <Tooltip
              contentStyle={{ color: "#000" }}
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

function GraphView(props) {
  return (
    <div className="graph-container">
      <div className="flex-container">
        <div className="flex-item left">
          <h1>Location Insights</h1>
          <div className="filter-container">
            <UserControlPanel
              chemicals={[]}
              filters={props.filters}
              onFilterChange={props.onFilterChange}
            ></UserControlPanel>
          </div>
          <GraphSummary
            viewport={props.viewport}
            filters={props.filters}
          ></GraphSummary>
        </div>
        <div className="flex-item right">
          <div className="graphs">
            <TimelineTotal
              viewport={props.viewport}
              filters={props.filters}
            ></TimelineTotal>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="top_facilities"
              graph={GraphTopTenFacilities}
              title="Total Releases for Top 10 Facilities (in lbs)"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="top_parents"
              graph={GraphTopTenParents}
              title="Total On-Site Releases for Top 10 Parent Companies (in lbs)"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="top_chemicals"
              graph={GraphTopTenChemicals}
              title="Top Ten Chemicals (in lbs)"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="timeline_facilities"
              graph={TimelineTopFacilities}
              title="Total Releases Over Time for Top Ten Facilities (in lbs)"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="timeline_parents"
              graph={TimelineTopParents}
              title="Total Releases Over Time for Top Ten Parent Companies (in lbs)"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="timeline_chemicals"
              graph={TimelineTopChemicals}
              title="Top Ten Chemicals Over Time (in lbs)"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="top_parents"
              graph={GraphAllFacilities}
              title="Total Releases for all Facilities (in lbs)"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="top_parents"
              graph={TableAllFacilities}
              title="Total Releases for all Facilities (in lbs)"
            ></GraphContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphView;
