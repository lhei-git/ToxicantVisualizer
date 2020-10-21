import "./index.css";
import "../index.css";
import ChemTypeSelector from "./ChemTypeSelector.js";
const React = require("react");

const startYear = 2005;
const endYear = 2018;
const types = ["all", "air", "water", "land", "off-site", "on-site"];

//search button and text box
function UserControlPanel(props) {
  function onFilterChange(event) {
    const filters = props.filters;
    filters[event.attribute] = event.value;
    props.onFilterChange(filters);
  }

  function onSelectChange(event) {
    const filters = props.filters;
    filters[event.target.name] = event.target.value;
    props.onFilterChange(filters);
  }

  function getYears() {
    let years = [];
    for (let i = startYear; i <= endYear; i++) {
      years.push(
        <option selected={i === endYear} value={i}>
          {i}
        </option>
      );
    }
    return years;
  }

  return (
    <div className="control-container">
      <div className="header">
        {/* Search Bar Title and Image */}
        Facilities found: <span>{props.numFacilities || 0}</span>
      </div>
      <div className="content">
        {/* Collapsing Search Bar Content*/}
        <div className="refresh" onClick={props.onRefresh}>
          <img alt="" src={require("../assets/refresh.png")}></img>
        </div>
        <ChemTypeSelector
          title="Only Show Carcinogens"
          attribute="carcinogens"
          defaultChecked={false}
          onClick={onFilterChange}
        />
        <ChemTypeSelector
          title="Only Show PBTs"
          attribute="dioxins"
          defaultChecked={false}
          onClick={onFilterChange}
        />
        <div className="type-selector">
          <label htmlFor="releaseType">Release Type</label>
          <select name="releaseType" onChange={onSelectChange} id="">
            {(function () {
              return types.map((type) => {
                return <option>{type}</option>;
              });
            })()}
          </select>
        </div>
        <div className="year-selector">
          <label htmlFor="year">Year</label>
          <select name="year" onChange={onSelectChange} id="">
            {getYears()}
          </select>
        </div>
      </div>
    </div>
  );
}

export default UserControlPanel;
