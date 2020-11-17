import React from "react";
import "./index.css";
import { useEffect } from "react";
import { formatAmount } from "../helpers";
const vetapi = require("../api/vetapi");
const unitedStates = require("./unitedStates");

function GraphSummary(props) {
  const [body, setBody] = React.useState(null);

  let graphProp = props.graph;
  let viewportProp = props.viewport;
  let filterProp = props.filters;

  useEffect(() => {
    let mounted = true;
    fetchData(mounted);

    return () => (mounted = false);
  }, [graphProp, viewportProp, filterProp]); /* eslint-disable-line */

  const fetchData = async (mounted) => {
    try {
      const { year } = props.filters;
      const { northeast, southwest } = props.viewport;
      const params = {
        ne_lat: northeast.lat,
        ne_lng: northeast.lng,
        sw_lat: southwest.lat,
        sw_lng: southwest.lng,
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
      Object.keys(country).forEach((k) => {
        country[k] = formatAmount(country[k]);
      });
      const body = (
        <tbody>
          <tr>
            <td>Facilities</td>
            <td>{data["num_facilities"]}</td>
            <td>{country["num_facilities"]}</td>
          </tr>
          <tr>
            <td>Distinct Chemicals</td>
            <td>{data["num_distinct_chemicals"]}</td>
            <td>{country["num_distinct_chemicals"]}</td>
          </tr>
          <tr>
            <td>Total Disposal Amount</td>
            <td>{data["total"]}</td>
            <td>{country["total"]}</td>
          </tr>
          <tr>
            <td>On-Site Releases</td>
            <td>{data["total_on_site"]}</td>
            <td>{country["total_on_site"]}</td>
          </tr>
          <tr>
            <td>Off-Site Releases</td>
            <td>{data["total_off_site"]}</td>
            <td>{country["total_off_site"]}</td>
          </tr>
          <tr>
            <td>Air Releases</td>
            <td>{data["total_air"]}</td>
            <td>{country["total_air"]}</td>
          </tr>
          <tr>
            <td>Water Releases</td>
            <td>{data["total_water"]}</td>
            <td>{country["total_water"]}</td>
          </tr>
          <tr>
            <td>Land Releases</td>
            <td>{data["total_land"]}</td>
            <td>{country["total_land"]}</td>
          </tr>
          <tr>
            <td>Carcinogenic Releases</td>
            <td>{res.data["total_carcinogen"]}</td>
            <td>{country["total_carcinogen"]}</td>
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
      <div className="standalone summary">
        <div className="header">Summary</div>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
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
