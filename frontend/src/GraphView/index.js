import "./index.css";
const axios = require("../api/axios");
const React = require("react");
const {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
} = require("recharts");

class CustomizedAxisTick extends React.Component {
  render() {
    const { x, y, stroke, payload } = this.props;
    console.log(payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          fontSize="12"
          transform="rotate(35)"
          x={0}
          y={0}
          dy={16}
          fill="#666"
        >
          <tspan textAnchor="beginning" x="0" dy="0">
            {payload.value}
          </tspan>
        </text>
      </g>
    );
  }
}

function GraphContainer(props) {
  let [graph, setGraph] = React.useState(null);
  let [viewport] = React.useState(localStorage.getItem("viewport") || {});

  React.useEffect(() => {
    async function fetchData() {
      if (!props.graph) return;
      const g = await props.graph(viewport);

      setGraph(g);
    }
    fetchData();
  }, [props, viewport]);

  return (
    <div className="graph">
      <div className="header">{props.title}</div>
      <div className="rechart">{graph}</div>
    </div>
  );
}

async function GraphSummary(viewport) {
  try {
    const ne = JSON.parse(viewport).northeast;
    const sw = JSON.parse(viewport).southwest;
    const res = await axios.get(
      `/stats/location/summary?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
    );
    let rows = Object.keys(res.data).map((row, i) => (
      <tr key={row}>
        <td>{row.replace("_", " ")}</td>
        <td>{+res.data[row].toFixed(2)}</td>
      </tr>
    ));
    return (
      <div className="summary">
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current Location</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  } catch (err) {
    console.log(err);
    return <div>ERROR: Summary statistics could not be found.</div>;
  }
}

async function GraphTopTenFacilities(viewport) {
  try {
    const ne = JSON.parse(viewport).northeast;
    const sw = JSON.parse(viewport).southwest;
    const res = await axios.get(
      `/stats/location/facility_releases?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
    );
    const data = res.data
      .map((d, i) => {
        return {
          name: d.fields.facilityname,
          pv: d.fields.totalreleases,
        };
      })
      .sort((a, b) => b.pv - a.pv)
      .slice(0, 10);
    return (
      <div className="top-ten facilities">
        <ResponsiveContainer width="90%" aspect={16 / 9}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 30,
              right: 150,
              left: 50,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis
              dataKey="name"
              type="category"
              orientation="right"
              tick={<CustomizedAxisTick />}
            />
            <XAxis type="number" unit="lbs" />
            <Tooltip />
            <Legend />
            <Bar name="release amount (lbs)" dataKey="pv" fill="#5b8e7d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    console.log(err);
    return <div></div>;
  }
}

async function GraphTopTenParents(viewport) {
  const layout = "vertical";

  try {
    const ne = JSON.parse(viewport).northeast;
    const sw = JSON.parse(viewport).southwest;
    const res = await axios.get(
      `/stats/location/parent_releases?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
    );
    const data = res.data
      .map((d, i) => {
        return {
          name: d.fields.parentconame,
          pv: d.fields.totalreleases,
        };
      })
      .sort((a, b) => b.pv - a.pv)
      .slice(0, 10);

    return (
      <div className="top-ten parents">
        <ResponsiveContainer width="90%" aspect={16 / 9}>
          <BarChart
            data={data}
            layout={layout}
            margin={{
              top: 30,
              right: 150,
              left: 50,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis
              dataKey="name"
              type="category"
              orientation="right"
              tick={<CustomizedAxisTick />}
            />
            <XAxis type="number" unit="lbs" />
            <Tooltip />
            <Legend />
            <Bar name="release amount (lbs)" dataKey="pv" fill="#5b8e7d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    console.log(err);
    return <div></div>;
  }
}

async function GraphTopChemicals(viewport) {
  try {
    const ne = JSON.parse(viewport).northeast;
    const sw = JSON.parse(viewport).southwest;
    const res = await axios.get(
      `/stats/location/chemcounts?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
    );
    const data = Object.keys(res.data)
      .map((key, i) => {
        return {
          name: key,
          pv: res.data[key],
        };
      })
      .sort((a, b) => b.pv - a.pv)
      .slice(0, 10);
    return (
      <div className="top-ten parents">
        <ResponsiveContainer width="90%" aspect={16 / 9}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 30,
              right: 30,
              left: 50,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis
              dataKey="name"
              type="category"
              orientation="right"
              tick={<CustomizedAxisTick />}
            />
            <XAxis type="number" />
            <Tooltip />
            <Legend />
            <Bar name="Occurrances" dataKey="pv" fill="#5b8e7d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (err) {
    console.log(err);
    return <div></div>;
  }
}

function GraphView() {
  return (
    <div className="graph-container">
      <GraphContainer
        name="summary"
        hidden={false}
        graph={GraphSummary}
        title="Summary"
      ></GraphContainer>
      <GraphContainer
        name="total_facilities"
        graph={GraphTopTenFacilities}
        title="Total releases (on-site+off-site) for top 10 facilities (in lbs)"
      ></GraphContainer>
      <GraphContainer
        name="total_parents"
        graph={GraphTopTenParents}
        title="Total Releases for the top 10 parent companies (in lbs)"
      ></GraphContainer>
      <GraphContainer
        name="top_graphs"
        graph={GraphTopChemicals}
        title="Top Ten Chemicals (in # occurrances)"
      ></GraphContainer>
    </div>
  );
}

export default GraphView;
