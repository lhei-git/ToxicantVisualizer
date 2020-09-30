import "./index.css";
import "../index.css";
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
          placeholder="Enter an address, zip code, city"
        />
        <button onClick={() => this.props.onSearch(this.state.searchBar)}>
          Search
        </button>
      </div>
    );
  }
}

export default SearchBar;
