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
    for (let i = endYear; i >= startYear; i--) {
      years.push(
        <option selected={i === endYear} value={i}>
          {i}
        </option>
      );
    }
    return years;
  }

  function getChemicals() {
    let chemicals = [];
    chemicals.push(
      <option selected={true} value="all">
        all
      </option>
    );
    for (var chemical of props.chemicals) {
      chemicals.push(<option value={chemical}>{chemical}</option>);
    }
    return chemicals;
  }

  return (
    <div className="control-container">
      <div className="header">
        {/* Search Bar Title and Image */}
        <span>{props.numFacilities || 0}</span> Facilities found
      </div>
      <div className="content">
        {/* Search Bar Content*/}
        <div className="flex-item one">
          <div className="selector">
            <label htmlFor="releaseType">Release Type</label>
            <select name="releaseType" onChange={onSelectChange} id="">
              {(function () {
                return types.map((type) => {
                  return <option>{type}</option>;
                });
              })()}
            </select>
          </div>
          <div className="selector">
            <label htmlFor="year">Year</label>
            <select name="year" onChange={onSelectChange} id="">
              {getYears()}
            </select>
          </div>
          <div className="selector">
            <label htmlFor="chemical">Chemical</label>
            <select name="chemical" onChange={onSelectChange} id="">
              {getChemicals()}
            </select>
          </div>
        </div>
        <div className="flex-item two">
          <ChemTypeSelector
            title="Only Show Carcinogens"
            attribute="carcinogens"
            defaultChecked={false}
            onClick={onFilterChange}
          />
          {/* <ChemTypeSelector
            title="Only Show PBTs"
            attribute="dioxins"
            defaultChecked={false}
            onClick={onFilterChange}
          /> */}
        </div>
      </div>
    </div>
  );
}

export default UserControlPanel;
