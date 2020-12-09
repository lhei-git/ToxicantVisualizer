const React = require("react");

function getLocationString(map) {
  let str = map.city
    ? map.city + ", "
    : map.county
    ? map.county + " County, "
    : "";
  str += map.state;
  return str;
}

/* format release type for title */
function getReleaseTypeString(releaseType) {
  return releaseType !== "all" ? releaseType.replace("_", " ") : "";
}

/* Create formatted Title Component title given filter information */
function Title(title, props, hasChemical, hideReleaseType, hideYear) {
  const locationString = props.map ? ` in ${getLocationString(props.map)}` : "";
  return (
    <>
      <h1>
        Total{" "}
        {hideReleaseType
          ? ""
          : getReleaseTypeString(props.filters.releaseType) + " "}
        releases <span>{title}</span>
        {locationString}
        {hideYear ? "" : ` in ${props.filters.year}`}
      </h1>
      <h2>{getSubHeader(props.filters, hasChemical)}</h2>
    </>
  );
}

const getSubHeader = (filters, hasChemical) => {
  if (filters.chemical !== "all") {
    return filters.chemical;
  } else if (filters.carcinogen && filters.pbt) {
    return "carcinogens and PBTs";
  } else if (filters.carcinogen) {
    return "carcinogens only";
  } else if (filters.pbt) {
    return "PBTs only";
  } else if (hasChemical) {
    return "all chemicals";
  } else {
    return "";
  }
};

export default Title;
