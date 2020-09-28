import "./index.css";
import "../index.css";
const React = require("react");
const Component = React.Component;

//search button and text box
class SearchField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchField: "",
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
      <div className="searchField">
        <input
          type="text"
          name="searchField"
          value={this.state.searchField}
          onChange={this.handleChange}
          id="searchField"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              this.props.onSearch(this.state.searchField);
            }
          }}
          placeholder="Enter an address, zip code, city"
        />
        <button onClick={() => this.props.onSearch(this.state.searchField)}>
          Search
        </button>
      </div>
    );
  }
}

export default SearchField;
