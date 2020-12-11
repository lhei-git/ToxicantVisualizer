import PropTypes from "prop-types";
const React = require("react");

/* Create concise location string for display purposes */
function getLocationString(map) {
  let str = map.city
    ? map.city + ", "
    : map.county
    ? map.county + " County, "
    : "";
  str += map.state;
  return str;
}

/* remove underscores from title */
function getReleaseTypeString(releaseType) {
  return releaseType !== "all" ? releaseType.replace("_", " ") : "";
}

/* Create formatted Title Component for given filter */

function Title(props) {
  const locationString = props.map ? ` in ${getLocationString(props.map)}` : "";
  return (
    <>
      <h1>
        Total{" "}
        {props.showReleaseType
          ? getReleaseTypeString(props.filters.releaseType) + " "
          : ""}
        releases <span>{props.text}</span>
        {locationString}
        {props.showYear ? ` in ${props.filters.year}` : ""}
      </h1>
      <h2>{getSubHeader(props.filters, props.showChemicalName)}</h2>
    </>
  );
}

/* Create formatted subheader based on filter information */
const getSubHeader = (filters, showChemicalName) => {
  if (filters.carcinogen && filters.pbt) {
    return "carcinogens and PBTs";
  } else if (filters.carcinogen) {
    return "carcinogens only";
  } else if (filters.pbt) {
    return "PBTs only";
  } else if (showChemicalName) {
    if (filters.chemical !== "all") return filters.chemical;
    else return "all chemicals";
  } else {
    return "";
  }
};

Title.propTypes = {
  map: PropTypes.shape({
    city: PropTypes.string,
    county: PropTypes.string,
    state: PropTypes.string,
  }),
  filters: PropTypes.shape({
    year: PropTypes.number,
    releaseType: PropTypes.string,
    pbt: PropTypes.bool,
    carcinogen: PropTypes.bool,
    chemical: PropTypes.string,
  }),
  showYear: PropTypes.bool,
  showReleaseType: PropTypes.bool,
  showChemicalName: PropTypes.bool,
};

Title.defaultProps = {
  showYear: true,
  showReleaseType: true,
  showChemicalName: true,
};

export default Title;
