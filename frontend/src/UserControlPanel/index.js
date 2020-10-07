import "./index.css";
import "../index.css";
import ChemTypeSelector from './ChemTypeSelector.js'
const React = require("react");
const Component = React.Component;

//search button and text box
class UserControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
        open: false,
        dioxins: true,
        carcinogens: true,
        otherChems: true,
    };

    this.onChemTypeChange = this.onChemTypeChange.bind(this);
    this.togglePanel = this.togglePanel.bind(this);
  }

  onChemTypeChange(event) {
    this.setState({
      [event.attribute]: event.value,
    });
  }

  togglePanel(e){
    this.setState({open: !this.state.open})
  }

 render() {
    return (
    <div>
        <div
            onClick={(e)=>this.togglePanel(e)}
            className="header">
                {/* Search Bar Title and Image */}
                Search Options</div>
                {this.state.open ? (
                <div className="content">
                {/* Collapsing Search Bar Content*/}
                <ChemTypeSelector title="Carcinogens" attribute="carcinogens" defaultChecked={this.state.carcinogens} onClick={this.onChemTypeChange}/>
                <ChemTypeSelector title="Dioxins" attribute="dioxins" defaultChecked={this.state.dioxins} onClick={this.onChemTypeChange}/>
                <ChemTypeSelector title="Other Chemicals" attribute="otherChems" defaultChecked={this.state.otherChems} onClick={this.onChemTypeChange}/>
        </div>
            ) : null}
    </div>);
        }
}


export default UserControlPanel;