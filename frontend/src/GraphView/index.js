import "./index.css";
import React, { useEffect, useState } from "react";
import UserControlPanel from "../UserControlPanel";
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
  onSite: "#f65858",
  offSite: "#e9d700",
  air: "#8d8d8d",
  water: "#59954a",
  land: "#844b11"
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
        <div className="graph-header">{props.title}</div>
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
      chemical: props.filters.chemical,
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
            <Bar name="air" dataKey="av" stackId="a" fill={barColors.air} />
            <Bar name="water" dataKey="bv" stackId="a" fill={barColors.water} />
            <Bar name="land" dataKey="cv" stackId="a" fill={barColors.land} />
            <Bar
              name="off-site"
              dataKey="dv"
              stackId="a"
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
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      // carcinogen: props.filters.carcinogens || null,
      // dioxin: props.filters.pbtsAndDioxins || null,
      // pbt: props.filters.pbtsAndDioxins || null,
      // release_type: props.filters.releaseType,
      // chemical: props.filters.chemical,
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

async function GraphTopTenPBTs(props) {
  try {
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      carcinogen: props.filters.carcinogens || null,
      release_type: props.filters.releaseType,
      year: props.filters.year,
    };
    const res = await vetapi.get(`/stats/location/top_pbt_chemicals`, {
      params,
    });
    const data = res.data
      .map((d) => {
        const f = d;
        return {
          name: f.chemical__name,
          pv: f.total,
        };
      })
      .sort((a, b) => b.pv - a.pv);
    return (
      <div>
        <ResponsiveContainer width="100%" aspect={16 / 9}>
          <BarChart
            data={data}
            margin={{
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
              name="release amount (lbs)"
              dataKey="pv"
              stackId="a"
              fill={barColors.onSite}
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
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      // carcinogen: props.filters.carcinogens || null,
      // dioxin: props.filters.pbtsAndDioxins || null,
      // pbt: props.filters.pbtsAndDioxins || null,
      // release_type: props.filters.releaseType,
      // chemical: props.filters.chemical,
      year: props.filters.year,
      all: 1,
    };
    const res = await vetapi.get(`/stats/location/facility_releases`, {
      params,
    });
    // const data = res.data
    //   .sort((a, b) => b.total - a.total)
    //   .map((d, i) => {
    //     const f = d;
    //     return {
    //       name: f.facility__name,
    //       av: f.air,
    //       bv: f.water,
    //       cv: f.land,
    //     };
    //   });
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
      chemical: props.filters.chemical,
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
            margin={{
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
            <Bar name="air" dataKey="av" stackId="a" fill={barColors.air} />
            <Bar name="water" dataKey="bv" stackId="a" fill={barColors.water} />
            <Bar name="land" dataKey="cv" stackId="a" fill={barColors.land} />
            <Bar
              name="off-site"
              dataKey="dv"
              stackId="a"
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
          name: d.chemical__name,
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
              name="release amount (lbs)"
              dataKey="pv"
              stackId="a"
              fill={barColors.onSite}
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

const compare = (a, b) => {
  console.log("typeof a.year :>> ", typeof a.year);
  return a.year - b.year;
};

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
      chemical: props.filters.chemical,
      release_type: props.filters.releaseType,
      averages: true,
    };
    const res = await vetapi.get(`/stats/location/timeline/facility_releases`, {
      params,
    });

    let data = res.data.lines
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
      .sort(compare);

    const correctIndex = [...data].sort(
      (a, b) => Object.keys(b).length - Object.keys(a).length
    )[0];
    const keys = Object.keys(correctIndex);
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
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      carcinogen: props.filters.carcinogens || null,
      dioxin: props.filters.pbtsAndDioxins || null,
      pbt: props.filters.pbtsAndDioxins || null,
      chemical: props.filters.chemical,
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
      .sort(compare);

    const correctIndex = [...data].sort(
      (a, b) => Object.keys(b).length - Object.keys(a).length
    )[0];
    const keys = Object.keys(correctIndex);
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
          <LineChart width={500} height={300} data={data}>
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

    const correctIndex = [...data].sort(
      (a, b) => Object.keys(b).length - Object.keys(a).length
    )[0];
    const keys = Object.keys(correctIndex);
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
          <LineChart width={500} height={300} data={data}>
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

function GraphView(props) {
  const [currentGroup, setCurrentGroup] = React.useState(
    parseInt(sessionStorage.getItem("currentGroup")) || 0
  );

  function chooseTab(i) {
    sessionStorage.setItem("currentGroup", i);
    setCurrentGroup(i);
  }

  return (
    <div className="graph-container">
      <div className="selector">
        <ul>
          <li
            onClick={() => chooseTab(0)}
            className={currentGroup === 0 ? "active" : ""}
          >
            Top Tens
          </li>
          <li
            onClick={() => chooseTab(1)}
            className={currentGroup === 1 ? "active" : ""}
          >
            Timelines
          </li>
          <li
            onClick={() => chooseTab(2)}
            className={currentGroup === 2 ? "active" : ""}
          >
            Indexes
          </li>
        </ul>
      </div>
      <div className="content">
        {/* <h1>Location Insights</h1> */}
        <div className="filter-container">
          <UserControlPanel
            chemicals={[]}
            viewport={props.viewport}
            filters={props.filters}
            onFilterChange={props.onFilterChange}
          ></UserControlPanel>
        </div>
        <div className="graphs">
          <div
            class="top-tens"
            style={{ display: currentGroup === 0 ? "block" : "none" }}
          >
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="top_facilities"
              graph={GraphTopTenFacilities}
              title="Total releases for the top 10 facilities (in lbs)"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="top_parents"
              graph={GraphTopTenParents}
              title="Total releases for the top 10 parent companies (in lbs)"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="top_chemicals"
              graph={GraphTopTenChemicals}
              title="Total releases for the top 10 chemicals (in lbs)"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="top_pbts"
              graph={GraphTopTenPBTs}
              title="Total releases for the top 10 PBT chemicals (in lbs)"
            ></GraphContainer>
          </div>
          <div
            className="timelines"
            style={{ display: currentGroup === 1 ? "block" : "none" }}
          >
            <TimelineTotal
              viewport={props.viewport}
              filters={props.filters}
            ></TimelineTotal>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="timeline_facilities"
              graph={TimelineTopFacilities}
              title="Total releases for the top 10 facilities (in lbs) over time"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="timeline_parents"
              graph={TimelineTopParents}
              title="Total releases for the top 10 parent companies (in lbs) over time"
            ></GraphContainer>
            <GraphContainer
              viewport={props.viewport}
              filters={props.filters}
              name="timeline_chemicals"
              graph={TimelineTopChemicals}
              title="Total releases for the top 10 chemicals (in lbs) over time"
            ></GraphContainer>
          </div>
          <div
            className="indexes"
            style={{ display: currentGroup === 2 ? "block" : "none" }}
          >
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
