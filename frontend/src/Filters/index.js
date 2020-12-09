import "./index.css";
import "../index.css";
import vetapi from "../api/vetapi";
const React = require("react");
const { formatChemical } = require("../helpers");

//search button and text box
function UserControlPanel(props) {
  const [chemicals, setChemicals] = React.useState([]);

  /* Update chemical list with chemicals found in the selected window under the current search parameters */
  React.useEffect(() => {
    async function fetchChemicalList(map) {
      const params = {
        city: map.city,
        county: map.county,
        state: map.state,
        year: props.filters.year,
        release_type: props.filters.releaseType,
        pbt: props.filters.pbt,
        carcinogen: props.filters.carcinogen || null,
      };
      try {
        const res = await vetapi.get("/chemicals", { params });
        const tmp = [...new Set(res.data.map((d) => formatChemical(d)).sort())];
        setChemicals(tmp);
      } catch (err) {
        console.log(err);
      }
    }

    if (props.map) fetchChemicalList(props.map);
  }, [props.filters, props.map]);

  /* Update app-level filters when component-level filters change. Propagates change to other filters */
  function onFilterChange(event) {
    const target = event.target;
    const filters = Object.assign({}, props.filters);
    const value = target.type === "checkbox" ? target.checked : target.value;
    if (target.name === "year") filters[target.name] = parseInt(value);
    else filters[target.name] = value;
    if (["carcinogen", "pbt"].includes(target.name) && target.checked) {
      filters["chemical"] = "all";
    } else if (target.name === "chemical") {
      filters["carcinogen"] = false;
      filters["pbt"] = false;
    }
    props.onFilterChange(filters);
  }

  /* Create select dropdown of available years */
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

  /* Create select dropdown of chemicals released */
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

  /* Create select dropdown of release types */
  function getReleaseTypes() {
    const types = ["air", "water", "land", "off_site", "on_site"];

    return types.map((type) => {
      return (
        <option key={type} value={type}>
          {type.replace("_", "-")}
        </option>
      );
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
          <option defaultValue={true} key="all" value="all">
            All release types
          </option>
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
          <label htmlFor="carcinogen">Carcinogens only</label>
          <input
            type="checkbox"
            checked={props.filters.carcinogen}
            onChange={onFilterChange}
            name="carcinogen"
            id="carcinogen"
          />
        </div>
        <div className="checkbox-group">
          <label htmlFor="pbt">PBTs only</label>
          <input
            type="checkbox"
            checked={props.filters.pbt}
            onChange={onFilterChange}
            id="pbt"
            name="pbt"
          />
        </div>
      </div>
    </div>
  );
}

export default UserControlPanel;
