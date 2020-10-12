import "./index.css";
import "../index.css";
import ChemTypeSelector from "./ChemTypeSelector.js";
const React = require("react");
const Component = React.Component;

//search button and text box
class UserControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      dioxins: false,
      carcinogens: false,
      releaseType: "any",
    };

    this.onChemTypeChange = this.onChemTypeChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.togglePanel = this.togglePanel.bind(this);
  }

  onChemTypeChange(event) {
    this.setState(
      {
        [event.attribute]: event.value,
      },
      () => {
        this.props.onChemTypeChange(this.state);
      }
    );
  }

  onSelectChange(event){
    this.setState(
      {
        releaseType: event.target.value,
      },
      () => {
        this.props.onChemTypeChange(this.state);
      }
    );
  }

  togglePanel(e) {
    this.setState({ open: !this.state.open });
  }

  render() {
    return (
      <div className="control-container">
        <div onClick={(e) => this.togglePanel(e)} className="header">
          {/* Search Bar Title and Image */}
          Total Releases: {this.props.totalReleases || 0}
        </div>
        {this.state.open ? (
          <div className="content">
            {/* Collapsing Search Bar Content*/}
            <ChemTypeSelector
              title="Only Show Carcinogens"
              attribute="carcinogens"
              defaultChecked={this.state.carcinogens}
              onClick={this.onChemTypeChange}
            />
            <ChemTypeSelector
              title="Only Show Dioxins"
              attribute="dioxins"
              defaultChecked={this.state.dioxins}
              onClick={this.onChemTypeChange}
            />
            {/* <ChemTypeSelector
              title="Other Chemicals"
              attribute="otherChems"
              defaultChecked={this.state.otherChems}
              onClick={this.onChemTypeChange}
            /> */}
            <div class="type-selector">
              <label for="type">Release Type</label>
              <select name="type" onChange={this.onSelectChange} id="">
              <option value="any">Any</option>
                <option value="air">Air</option>
                <option value="water">Water</option>
                <option value="land">Land</option>
              </select>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default UserControlPanel;
