import "./index.css";
const React = require("react");

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  onSearchChange(event) {
    this.props.onSearchChange(event.target.value);
  }

  onSearchSubmit(event) {
    event.preventDefault();
    this.props.onSearchSubmit();
  }

  render() {
    return (
      <div className="home-container">
        <div className="header">
          Visualizer of Environmental Toxicants (VET)
        </div>
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
          <form onSubmit={this.onSearchSubmit}>
            <label htmlFor="search">
              Enter a zip code; a city, state combination; or a state.
            </label>
            <input type="text" id="search" onChange={this.onSearchChange} />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    );
  }
}

export default Home;
