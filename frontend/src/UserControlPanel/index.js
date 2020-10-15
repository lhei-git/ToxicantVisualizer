import "./index.css";
import "../index.css";
import ChemTypeSelector from "./ChemTypeSelector.js";
const React = require("react");

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

  return (
    <div className="control-container">
      <div className="header">
        {/* Search Bar Title and Image */}
        Total Releases: {props.numReleases || 0}
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
          title="Only Show Dioxins"
          attribute="dioxins"
          defaultChecked={false}
          onClick={onFilterChange}
        />
        <div className="type-selector">
          <label htmlFor="releaseType">Release Type</label>
          <select name="releaseType" onChange={onSelectChange} id="">
            <option value="any">Any</option>
            <option value="air">Air</option>
            <option value="water">Water</option>
            <option value="land">Land</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default UserControlPanel;
