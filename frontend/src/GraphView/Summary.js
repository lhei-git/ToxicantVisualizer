import React from "react";
import "./index.css";
import { useEffect } from "react";
import { formatAmount, getLocationString } from "../helpers";
import PropTypes from "prop-types";
const vetapi = require("../api/vetapi");
const unitedStates = require("../data/unitedStates");

/* Summary graph showing basic information about current location and entire United States */
function GraphSummary({ map, filters }) {
  const [body, setBody] = React.useState(null);
  let year = filters.year;

  /* Fetch new data when location,  */
  useEffect(() => {
    let mounted = true;
    fetchData(mounted);

    return () => (mounted = false);
  }, [map, year]); /* eslint-disable-line */

  const fetchData = async (mounted) => {
    try {
      const { year } = filters;
      const params = {
        city: map.city,
        county: map.county,
        state: map.state,
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
            {getLocationString(map, true)} and U.S. in {filters.year}
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
GraphSummary.propTypes = {
  filters: PropTypes.shape({
    chemical: PropTypes.string.isRequired,
    pbt: PropTypes.bool.isRequired,
    carcinogen: PropTypes.bool.isRequired,
    releaseType: PropTypes.oneOf([
      "all",
      "air",
      "water",
      "land",
      "on_site",
      "off_site",
    ]).isRequired,
    year: PropTypes.number.isRequired,
  }),
  map: PropTypes.shape({
    city: PropTypes.string,
    county: PropTypes.string,
    state: PropTypes.string,
    stateLong: PropTypes.string,
    center: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }).isRequired,
    viewport: PropTypes.shape({
      northeast: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }).isRequired,
      southwest: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }).isRequired,
    }),
  }),
};
export default GraphSummary;
