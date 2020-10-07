import "./index.css";
import "../index.css";
import UserControlPanel from '../UserControlPanel/index.js'
const React = require("react");
const Component = React.Component;

//search button and text box
class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchBar: "",
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange({ target }) {
    this.setState({
      [target.name]: target.value,
    });
  }

  render() {
    return (
    <>
      <div className="search-bar">
        <input
          type="text"
          name="searchBar"
          value={this.state.searchBar}
          onChange={this.handleChange}
          id="searchBar"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              this.props.onSearch(this.state.searchBar);
            }
          }}
          placeholder="Enter an address, zip code, city, or chemical"
        />
        <button onClick={() => this.props.onSearch(this.state.searchBar)}>
          Search
        </button>
      </div>
      <div>
        <UserControlPanel />
      </div>
    </>
    );
  }
}

export default SearchBar;
