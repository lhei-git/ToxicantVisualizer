import "./index.css";
const React = require("react");

function Home(props) {
  let [searchValue, setSearchValue] = React.useState(
    localStorage.getItem("searchedLocation") || ""
  );

  function onSearchChange(event) {
    setSearchValue(event.target.value);
    props.onSearchChange(event.target.value);
  }

  function onSearchSubmit(event) {
    if (searchValue.length === 0) return;
    event.preventDefault();
    props.onSearchSubmit();
  }

  return (
    <div className="home-container">
      <div className="background">
        <div className="overlay"></div>
        <img src={require("./../../src/assets/vet_la.png")} alt="" />
      </div>
      <div className="content-group">
        <div className="header">Visualizer of Environmental Toxicants</div>
        <div className="caption">
          This VET tool was developed to obtain information from the Toxic
          Releases Inventory data of the U.S. EPA, and associated chemical
          information from the PubChem database, to map, organize and visualize
          information about releases of chemicals into water, air and land by
          manufacturing facilities across the U.S. This tool is for exploratory
          purposes only, focused on potential health issues with toxic releases.
          Any decision related to information herein should be made with other
          relevant information and analyses.
        </div>
        <div className="search-bar">
          {props.isError && <div className="error">ERROR: location not found</div>}
          <form onSubmit={onSearchSubmit}>
            <label htmlFor="search">
              Enter a zip code; a city, state combination; or a state.
            </label>
            <input
              type="text"
              id="search"
              value={searchValue}
              onChange={onSearchChange}
            />
            {/* <label htmlFor="search">Blank box defaults to entire U.S.</label> */}
            <button
              type="submit"
              className={searchValue.length === 0 ? "hidden" : ""}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
