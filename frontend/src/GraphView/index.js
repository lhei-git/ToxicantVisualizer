import "./index.css";
import React, { Component, useEffect, useState } from "react";
import UserControlPanel from "../UserControlPanel";
const vetapi = require("../api/vetapi");
const { formatChemical, intToString } = require("../helpers");
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

const colors = [
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

function handleError(err) {
  /* do something here */
}

class CustomizedXAxisTick extends Component {
  render() {
    const { x, y, payload } = this.props;
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
}

// class CustomizedYAxisTick extends Component {
//   render() {
//     const { x, y, payload } = this.props;
//     return (
//       <g transform={`translate(${x},${y})`}>
//         <text
//           fontSize="12"
//           transform="rotate(35)"
//           x={0}
//           y={0}
//           dy={16}
//           fill="#FFF"
//         >
//           <tspan textAnchor="beginning" x="0" dy="0">
//             {payload.value}
//           </tspan>
//         </text>
//       </g>
//     );
//   }
// }

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

async function TimelineTotal(props) {
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
    const res = await vetapi.get(`/stats/location/timeline/total`, {
      params,
    });
    return (
      <div className="top-ten facilities">
        <ResponsiveContainer width="100%" aspect={16 / 7}>
          <LineChart
            width={500}
            height={300}
            data={res.data}
            margin={{
              top: 5,
              right: 50,
              left: 50,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis type="number" unit="lbs" />
            <Tooltip
              contentStyle={{ color: "#000" }}
              isAnimationActive={false}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke={colors[Math.floor(Math.random() * 10)]}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 8 }}
            ></Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    handleError(err);
    return null;
  }
}

async function GraphSummary(props) {
  function format(x) {
    return x.toLocaleString();
  }

  try {
    const { northeast, southwest } = props.viewport;
    const params = {
      ne_lat: northeast.lat,
      ne_lng: northeast.lng,
      sw_lat: southwest.lat,
      sw_lng: southwest.lng,
      year: props.filters.year,
    };
    const res = await vetapi.get(`/stats/location/summary`, {
      params,
    });
    const body = (
      <tbody>
        <tr>
          <td>Facilities</td>
          <td>{res.data["num_facilities"]}</td>
        </tr>
        <tr>
          <td>Distinct Chemicals</td>
          <td>{res.data["num_distinct_chemicals"]}</td>
        </tr>
        <tr>
          <td>Total Disposal Amount</td>
          <td>{format(res.data["total"])} lbs</td>
        </tr>
        <tr>
          <td>On-Site Releases</td>
          <td>{format(res.data["total_on_site"])} lbs</td>
        </tr>
        <tr>
          <td>Off-Site Releases</td>
          <td>{format(res.data["total_off_site"])} lbs</td>
        </tr>
        <tr>
          <td>Air Releases</td>
          <td>{format(res.data["total_air"])} lbs</td>
        </tr>
        <tr>
          <td>Water Releases</td>
          <td>{format(res.data["total_water"])} lbs</td>
        </tr>
        <tr>
          <td>Land Releases</td>
          <td>{format(res.data["total_land"])} lbs</td>
        </tr>
        <tr>
          <td>Carcinogenic Releases</td>
          <td>{format(res.data["total_carcinogen"])} lbs</td>
        </tr>
      </tbody>
    );
    return (
      <div className="summary">
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current Location</th>
            </tr>
          </thead>
          {body}
        </table>
      </div>
    );
  } catch (err) {
    handleError(err);
    return null;
  }
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
      <div className="top-ten facilities">
        <ResponsiveContainer width="100%" aspect={16 / 9}>
          <BarChart
            data={data}
            margin={{
              top: 30,
              right: 50,
              left: 50,
              bottom: 200,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomizedXAxisTick />}
            />
            <YAxis type="number" unit="lbs" />
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
      .sort((a, b) => b.total - a.total)
      .map((d, i) => {
        const f = d;
        return {
          name: f.facility__parent_co_name,
          av: f.air,
          bv: f.water,
          cv: f.land,
        };
      });
    return (
      <div className="top-ten parents">
        <ResponsiveContainer width="100%" aspect={16 / 9}>
          <BarChart
            data={data}
            // layout="vertical"
            margin={{
              top: 30,
              right: 50,
              left: 50,
              bottom: 200,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomizedXAxisTick />}
            />
            <YAxis type="number" unit="lbs" />
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
      <div className="top-ten chemicals">
        <ResponsiveContainer width="100%" aspect={16 / 9}>
          <BarChart
            data={data}
            // layout="vertical"
            margin={{
              top: 30,
              right: 50,
              left: 50,
              bottom: 200,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              type="category"
              interval={0}
              tick={<CustomizedXAxisTick />}
            />
            <YAxis type="number" unit="lbs" />
            <Tooltip
              contentStyle={{ color: "#000" }}
              isAnimationActive={false}
            />
            <Legend align="right" verticalAlign="top" />
            <Bar
              name="release amount (lbs)"
              dataKey="pv"
              stackId="a"
              fill="#8884d8"
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
    };
    const res = await vetapi.get(`/stats/location/timeline/facility_releases`, {
      params,
    });
    const data = res.data
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
          stroke={colors[i] || "#8884d8"}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 8 }}
        ></Line>
      ));
    return (
      <div className="top-ten facilities">
        <ResponsiveContainer width="100%" aspect={16 / 7}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 50,
              left: 50,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => intToString(val) + " "}
            />
            <Tooltip
              contentStyle={{ color: "#000" }}
              isAnimationActive={false}
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
          stroke={colors[i] || "#8884d8"}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 8 }}
        ></Line>
      ));
    return (
      <div className="top-ten parents">
        <ResponsiveContainer width="100%" aspect={16 / 7}>
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 50,
              left: 50,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => intToString(val) + " "}
            />
            <Tooltip
              contentStyle={{ color: "#000" }}
              isAnimationActive={false}
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
          stroke={colors[i] || "#d9d9d9"}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 8 }}
        ></Line>
      ));
    return (
      <div className="top-ten chemicals">
        <ResponsiveContainer width="100%" aspect={16 / 7}>
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 50,
              left: 50,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" />
            <YAxis
              type="number"
              unit="lbs"
              width={100}
              tickFormatter={(val) => intToString(val) + " "}
            />
            <Tooltip
              contentStyle={{ color: "#000" }}
              isAnimationActive={false}
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
  const [visible, setVisible] = React.useState(false);
  const graphRef = React.useRef();

  const handleScroll = (event) => {
    try {
      const cur = event.target.scrollingElement.scrollTop;
      if (graphRef && cur >= graphRef.current.offsetTop) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="graph-container" ref={graphRef}>
      <h1>Location Insights</h1>
      <div className={`fixed-filter ${visible ? "" : "hidden"}`}>
        <UserControlPanel
          chemicals={[]}
          filters={props.filters}
          onFilterChange={props.onFilterChange}
        ></UserControlPanel>
      </div>
      <GraphContainer
        viewport={props.viewport}
        filters={props.filters}
        name="summary"
        hidden={false}
        graph={GraphSummary}
        title="Summary"
      ></GraphContainer>
      <GraphContainer
        viewport={props.viewport}
        filters={props.filters}
        name="total_facilities"
        graph={TimelineTotal}
        title="Total Releases"
      ></GraphContainer>
      <GraphContainer
        viewport={props.viewport}
        filters={props.filters}
        name="total_facilities"
        graph={GraphTopTenFacilities}
        title="Total On-Site Releases for Top 10 Facilities (in lbs)"
      ></GraphContainer>
      <GraphContainer
        viewport={props.viewport}
        filters={props.filters}
        name="total_parents"
        graph={GraphTopTenParents}
        title="Total On-Site Releases for Top 10 Parent Companies (in lbs)"
      ></GraphContainer>
      <GraphContainer
        viewport={props.viewport}
        filters={props.filters}
        name="top_graphs"
        graph={GraphTopTenChemicals}
        title="Top Ten Chemicals (in lbs)"
      ></GraphContainer>
      <GraphContainer
        viewport={props.viewport}
        filters={props.filters}
        name="top_graphs"
        graph={TimelineTopFacilities}
        title="Total Releases Over Time for Top Ten Facilities (in lbs)"
      ></GraphContainer>
      <GraphContainer
        viewport={props.viewport}
        filters={props.filters}
        name="top_graphs"
        graph={TimelineTopParents}
        title="Total Releases Over Time for Top Ten Parent Companies (in lbs)"
      ></GraphContainer>
      <GraphContainer
        viewport={props.viewport}
        filters={props.filters}
        name="top_graphs"
        graph={TimelineTopChemicals}
        title="Top Ten Chemicals Over Time (in lbs)"
      ></GraphContainer>
    </div>
  );
}

export default GraphView;
