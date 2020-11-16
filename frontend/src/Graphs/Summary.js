import React from "react";
import "./index.css";
import { useEffect } from "react";
import { formatAmount } from '../helpers';
const vetapi = require("../api/vetapi");

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
            <td>{formatAmount(res.data["total"])} lbs</td>
          </tr>
          <tr>
            <td>On-Site Releases</td>
            <td>{formatAmount(res.data["total_on_site"])} lbs</td>
          </tr>
          <tr>
            <td>Off-Site Releases</td>
            <td>{formatAmount(res.data["total_off_site"])} lbs</td>
          </tr>
          <tr>
            <td>Air Releases</td>
            <td>{formatAmount(res.data["total_air"])} lbs</td>
          </tr>
          <tr>
            <td>Water Releases</td>
            <td>{formatAmount(res.data["total_water"])} lbs</td>
          </tr>
          <tr>
            <td>Land Releases</td>
            <td>{formatAmount(res.data["total_land"])} lbs</td>
          </tr>
          <tr>
            <td>Carcinogenic Releases</td>
            <td>{formatAmount(res.data["total_carcinogen"])} lbs</td>
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
            </tr>
          </thead>
          {body}
        </table>
      </div>
    )
  );
}

export default GraphSummary;
