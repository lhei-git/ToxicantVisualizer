import "./index.css";
import "../index.css";
import vetapi from "../api/vetapi";
import { useEffect } from "react";
const React = require("react");
const { formatChemical } = require("../helpers");

//search button and text box
function UserControlPanel(props) {
  const [chemicals, setChemicals] = React.useState([]);

  React.useEffect(() => {
    console.log("filters changed");
  }, [props.filters]);

  useEffect(() => {
    if (props.map) fetchChemicalList(props.map);
  }, []);

  async function fetchChemicalList(map) {
    const params = {
      city: map.city,
      county: map.county,
      state: map.state,
      year: props.filters.year,
    };
    try {
      const res = await vetapi.get("/chemicals", { params });
      const tmp = [...new Set(res.data.map((d) => formatChemical(d)))];
      setChemicals(tmp);
    } catch (err) {
      console.log(err);
    }
  }

  function onFilterChange(event) {
    const target = event.target;
    const filters = props.filters;
    const value = target.type === "checkbox" ? target.checked : target.value;
    filters[target.name] = value;
    props.onFilterChange(filters);
  }

  function getYears() {
    const startYear = 2005;
    const endYear = 2019;
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
    let options = [];
    options.push(
      <option defaultValue={true} key="all" value="all">
        All chemicals
      </option>
    );
    if (chemicals.length === 0) return options;

    for (var chemical of chemicals) {
      options.push(
        <option key={chemical} value={chemical}>
          {chemical}
        </option>
      );
    }

    return options;
  }

  function getReleaseTypes() {
    const types = [
      "All release types",
      "air",
      "water",
      "land",
      "off_site",
      "on_site",
    ];

    return types.map((type) => {
      return <option key={type}>{type}</option>;
    });
  }

  return (
    <div className="control-container">
      <div className="content">
        {/* Search Bar Content*/}
        <select
          name="year"
          value={props.filters.year}
          onChange={onFilterChange}
          id=""
        >
          {getYears()}
        </select>
        <select
          name="releaseType"
          value={props.filters.releaseType}
          onChange={onFilterChange}
          id=""
        >
          {getReleaseTypes()}
        </select>
        <select
          name="chemical"
          value={props.filters.chemical}
          onChange={onFilterChange}
          id=""
        >
          {getChemicals()}
        </select>
        <div className="checkbox-group">
          <label htmlFor="carcinogens">Carcinogens only</label>
          <input
            type="checkbox"
            checked={props.filters.carcinogens}
            onChange={onFilterChange}
            name="carcinogens"
            id="carcinogens"
          />
        </div>
        <div className="checkbox-group">
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
  );
}

export default UserControlPanel;
