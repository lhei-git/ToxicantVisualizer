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

function DropdownIcon(props) {
  return (
    <svg
      className={`dropdown-icon ${!props.hidden ? "active" : ""}`}
      height="50px"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 100 100 L 400 100 L 250 300 z" fill="#FFF" />
    </svg>
  );
}

function GraphDropdown(props) {
  let [hidden, setHidden] = React.useState(props.hidden !== undefined ? props.hidden : true);
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

  const renderGraph = () => {
    setHidden(!hidden);
  };

  return (
    <div className="graph-dropdown">
      <div className="header" onClick={renderGraph}>
        {props.title}
      </div>
      <DropdownIcon hidden={hidden} />
      {hidden ? null : <div className="graph">{graph}</div>}
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
      <div className="top-ten facilities">
        <ResponsiveContainer width="60%" aspect={16 / 9}>
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
            <YAxis dataKey="name" type="category" orientation="right" dx={10} />
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
  try {
    const ne = JSON.parse(viewport).northeast;
    const sw = JSON.parse(viewport).southwest;
    const res = await axios.get(
      `/stats/location/parent_releases?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
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
        <ResponsiveContainer width="60%" aspect={16 / 9}>
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
            <YAxis dataKey="name" type="category" orientation="right" dx={10} />
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
      `/stats/location/chem_counts?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
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
        <ResponsiveContainer width="60%" aspect={16 / 9}>
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
            <YAxis dataKey="name" type="category" orientation="right" dx={10} />
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

////////////////////////////////////////////////////////////////////////////////////////
async function GraphAllFacilities(viewport) {
  try {
    const ne = JSON.parse(viewport).northeast;
    const sw = JSON.parse(viewport).southwest;
    const res = await axios.get(
      `/stats/location/facility_releases?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
    );
    const data = Object.keys(res.data)
      .map((key, i) => {
        return {
          name: key,
          pv: res.data[key],
        };
      })
      .sort((a, b) => b.pv - a.pv)
    return (
      <div className="all facilities">
        <ResponsiveContainer width="60%" aspect={16 / 9}>
          <BarChart
            data={data}
            layout="horizontal"
            margin={{
              top: 30,
              right: 30,
              left: 50,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis dataKey="name" type="category" orientation="right" dx={10} />
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

async function tableAllFacilities(viewport) {
  try {
    const ne = JSON.parse(viewport).northeast;
    const sw = JSON.parse(viewport).southwest;
    const res = await axios.get(
      `/stats/location/facility_releases?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
    );
    let rows = Object.keys(res.data).map((row, i) => (
      <tr key={row}>
        <td>{row.replace("_", " ")}</td>        //fac. name
        <td>{row.totalreleaseair}</td>          //total  air
        <td>{row.totalreleasewater}</td>        //total  water
        <td>{row.totalreleaseland}</td>         //total  land
        <td>{row.off_sitereleasetotal}</td>     //total  offsite
      </tr>
    ));
    return (
      <div className="tableAllFacilities">
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
///////////////////////////////////////////////////////////////////////////////////////////////

function GraphView() {
  return (
    <div className="graph-container">
      <GraphDropdown
        name="summary"
        hidden={false}
        graph={GraphSummary}
        title="Summary"
      ></GraphDropdown>
      <GraphDropdown
        name="total_facilities"
        graph={GraphTopTenFacilities}
        title="Total releases (on-site+off-site) for top 10 facilities (in lbs)"
      ></GraphDropdown>
      <GraphDropdown
        name="total_parents"
        graph={GraphTopTenParents}
        title="Total Releases for the top 10 parent companies (in lbs)"
      ></GraphDropdown>
      <GraphDropdown
        name="top_graphs"
        graph={GraphTopChemicals}
        title="Top Ten Chemicals (in # occurrances)"
      ></GraphDropdown>
        <GraphDropdown
        name="all_facilities"
        graph={GraphAllFacilities}
        title="All Facilities (in lbs)"
      ></GraphDropdown>
        <GraphDropdown
        name="all_facilities"
        graph={tableAllFacilities}
        title="All Facilities (in lbs)"
      ></GraphDropdown>
    </div>
  );
}

export default GraphView;
