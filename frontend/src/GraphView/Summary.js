import React from "react";
import "./index.css";
import { useEffect } from "react";
import { formatAmount, getLocationString } from "../helpers";
const vetapi = require("../api/vetapi");
const unitedStates = require("./unitedStates");

function GraphSummary(props) {
  const [body, setBody] = React.useState(null);

  let graphProp = props.graph;
  let mapProp = props.map;
  let yearProp = props.filters.year;

  useEffect(() => {
    let mounted = true;
    fetchData(mounted);

    return () => (mounted = false);
  }, [graphProp, mapProp, yearProp]); /* eslint-disable-line */

  const fetchData = async (mounted) => {
    try {
      const { year } = props.filters;
      const params = {
        city: props.map.city,
        county: props.map.county,
        state: props.map.state,
        year,
      };
      const res = await vetapi.get(`/stats/location/summary`, {
        params,
      });
      const data = res.data;
      Object.keys(data).forEach((k) => {
        data[k] = formatAmount(data[k]);
      });
      const country = unitedStates[year];
      const body = (
        <tbody>
          <tr>
            <td>Facilities</td>
            <td>{data["num_facilities"]}</td>
            <td>{formatAmount(country["num_facilities"])}</td>
          </tr>
          <tr>
            <td>Chemicals</td>
            <td>{data["num_chemicals"]}</td>
            <td>{formatAmount(country["num_chemicals"])}</td>
          </tr>
          <tr>
            <td>Total disposal amount (lbs)</td>
            <td>{data["total"]}</td>
            <td>{formatAmount(country["total"])}</td>
          </tr>
          <tr>
            <td>On-Site releases (lbs)</td>
            <td>{data["total_on_site"]}</td>
            <td>{formatAmount(country["total_on_site"])}</td>
          </tr>
          <tr>
            <td>Off-Site releases (lbs)</td>
            <td>{data["total_off_site"]}</td>
            <td>{formatAmount(country["total_off_site"])}</td>
          </tr>
          <tr>
            <td>Air releases (lbs)</td>
            <td>{data["total_air"]}</td>
            <td>{formatAmount(country["total_air"])}</td>
          </tr>
          <tr>
            <td>Water releases (lbs)</td>
            <td>{data["total_water"]}</td>
            <td>{formatAmount(country["total_water"])}</td>
          </tr>
          <tr>
            <td>Land releases (lbs)</td>
            <td>{data["total_land"]}</td>
            <td>{formatAmount(country["total_land"])}</td>
          </tr>
          <tr>
            <td>Carcinogenic releases (lbs)</td>
            <td>{res.data["total_carcinogen"]}</td>
            <td>{formatAmount(country["total_carcinogen"])}</td>
          </tr>
        </tbody>
      );

      if (mounted) setBody(body);
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  return (
    body !== null && (
      <div className="graph standalone summary">
        <div className="graph-header">
          <h1>
            Summary statistics of total releases for{" "}
            {getLocationString(props.map, true)} and U.S. in{" "}
            {props.filters.year}
          </h1>
        </div>
        <table>
          <thead>
            <tr>
              <th className="metric">Metric</th>
              <th>Current Location</th>
              <th>United States</th>
            </tr>
          </thead>
          {body}
        </table>
      </div>
    )
  );
}

export default GraphSummary;
