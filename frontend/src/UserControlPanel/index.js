import "./index.css";
import "../index.css";
const React = require("react");
const { shallowEqual } = require("../helpers");

const startYear = 2006;
const endYear = 2018;
const types = ["all", "air", "water", "land", "off_site", "on_site"];

//search button and text box
function UserControlPanel(props) {
  React.useEffect(() => {
    console.log("filters changed");
  }, [props.filters]);

  function onFilterChange(event) {
    const target = event.target;
    const filters = props.filters;
    const value = target.type === "checkbox" ? target.checked : target.value;
    filters[target.name] = value;
    props.onFilterChange(filters);
  }

  function getYears() {
    let years = [];
    for (let i = endYear; i >= startYear; i--) {
      years.push(
        <option defaultValue={i === endYear} key={i} value={i}>
          {i}
        </option>
      );
    }
    return years;
  }

  function getChemicals() {
    let chemicals = [];
    chemicals.push(
      <option defaultValue={true} key="all" value="all">
        all
      </option>
    );
    for (var chemical of props.chemicals) {
      chemicals.push(
        <option key={chemical} value={chemical}>
          {chemical}
        </option>
      );
    }

    return chemicals;
  }

  return (
    <div className="control-container">
      <div className="content">
        {/* Search Bar Content*/}
        <div className="flex-item one">
          <div className="selector">
            <label htmlFor="releaseType">Release Type</label>
            <select
              name="releaseType"
              value={props.filters.releaseType}
              onChange={onFilterChange}
              id=""
            >
              {(function () {
                return types.map((type) => {
                  return <option key={type}>{type}</option>;
                });
              })()}
            </select>
          </div>
          <div className="selector">
            <label htmlFor="year">Year</label>
            <select
              name="year"
              value={props.filters.year}
              onChange={onFilterChange}
              id=""
            >
              {getYears()}
            </select>
          </div>
          <div className="selector">
            <label htmlFor="chemical">Chemical</label>
            <select
              name="chemical"
              value={props.filters.chemical}
              onChange={onFilterChange}
              id=""
            >
              {getChemicals()}
            </select>
          </div>
        </div>
        <div className="flex-item two">
          <div className="selector">
            <label htmlFor="carcinogens">Carcinogens only</label>
            <input
              type="checkbox"
              checked={props.filters.carcinogens}
              onChange={onFilterChange}
              name="carcinogens"
              id="carcinogens"
            />
          </div>
          <div className="selector">
            <label htmlFor="pbtsAndDioxins">PBTs and Dioxins only</label>
            <input
              type="checkbox"
              checked={props.filters.pbtsAndDioxins}
              onChange={onFilterChange}
              id="pbtsAndDioxins"
              name="pbtsAndDioxins"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserControlPanel;
