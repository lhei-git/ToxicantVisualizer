import "./index.css";
const vetapi = require("../api/vetapi");
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

class CustomizedXAxisTick extends React.Component {
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
          fill="#666"
        >
          <tspan textAnchor="end" x="0" dy="0">
            {payload.value}
          </tspan>
        </text>
      </g>
    );
  }
}

class CustomizedYAxisTick extends React.Component {
  render() {
    const { x, y, payload } = this.props;
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
  let viewport = props.viewport;

  React.useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!props.graph || !props.viewport) return;
      const g = await props.graph(viewport);

      if (mounted) setGraph(g);
    }
    fetchData();

    return () => (mounted = false);
  }, [props, viewport]);

  return (
    <div className="graph">
      <div className="header">{props.title}</div>
      <div className="rechart">{graph}</div>
    </div>
  );
}

async function GraphSummary(viewport) {
  const format = (num) => {
    return +num.toFixed(2);
  };

  try {
    const ne = viewport.northeast;
    const sw = viewport.southwest;
    const res = await vetapi.get(
      `/stats/location/summary?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
    );
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
          <td>{format(res.data["total_disposal"])} lbs</td>
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
    console.log("summary error:", err);
    return <div>ERROR: Summary statistics could not be found.</div>;
  }
}

async function GraphTopTenFacilities(viewport) {
  try {
    const ne = viewport.northeast;
    const sw = viewport.southwest;
    const res = await vetapi.get(
      `/stats/location/facility_releases?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
    );
    const data = res.data
      .sort((a, b) => b.total - a.total)
      .map((d, i) => {
        const f = d;
        return {
          name: f.facility,
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
            <Tooltip />
            <Legend align="right" verticalAlign="top" />
            <Bar name="air" dataKey="av" stackId="a" fill="#8884d8" />
            <Bar name="water" dataKey="bv" stackId="a" fill="#82ca9d" />
            <Bar name="land" dataKey="cv" stackId="a" fill="#ffc658" />
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
  try {
    const ne = viewport.northeast;
    const sw = viewport.southwest;
    const res = await vetapi.get(
      `/stats/location/parent_releases?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
    );
    const data = res.data
      .sort((a, b) => b.total - a.total)
      .map((d, i) => {
        const f = d;
        return {
          name: f.parent_co_name,
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
            <Tooltip />
            <Legend align="right" verticalAlign="top" />
            <Bar name="air" dataKey="av" stackId="a" fill="#8884d8" />
            <Bar name="water" dataKey="bv" stackId="a" fill="#82ca9d" />
            <Bar name="land" dataKey="cv" stackId="a" fill="#ffc658" />
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
    const ne = viewport.northeast;
    const sw = viewport.southwest;
    const res = await vetapi.get(
      `/stats/location/chem_amounts?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
    );
    const data = res.data
      .map((d, i) => {
        return {
          name: d.chemical,
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
            <Tooltip />
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
    console.log(err);
    return <div></div>;
  }
}

function GraphView(props) {
  return (
    <div className="graph-container">
      <GraphContainer
        viewport={props.viewport}
        name="summary"
        hidden={false}
        graph={GraphSummary}
        title="Summary"
      ></GraphContainer>
      <GraphContainer
        viewport={props.viewport}
        name="total_facilities"
        graph={GraphTopTenFacilities}
        title="Total On-Site Releases for Top 10 Facilities (in lbs)"
      ></GraphContainer>
      <GraphContainer
        viewport={props.viewport}
        name="total_parents"
        graph={GraphTopTenParents}
        title="Total On-Site Releases for Top 10 Parent Companies (in lbs)"
      ></GraphContainer>
      <GraphContainer
        viewport={props.viewport}
        name="top_graphs"
        graph={GraphTopChemicals}
        title="Top Ten Chemicals (in lbs)"
      ></GraphContainer>
    </div>
  );
}

export default GraphView;
