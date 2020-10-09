import "./index.css";
import "../index.css";
import ChemTypeSelector from './ChemTypeSelector.js'
import DropDownSelector from './DropDownSelector.js'
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
        air: true,
        ground: true,
        water: true,

        // temporary array of chemicals to populate list
        tempChemicalButtons : [{title:"Ammonia", returnVal:"ammonia", selected:true},
                               {title:"Styrene", returnVal:"styrene", selected:true},
                               {title:"Florine", returnVal:"florine", selected:true},
                               {title:"Benzene", returnVal:"benzene", selected:true},
                               {title:"Formaldehyde", returnVal:"formaldehyde", selected:true},
                               {title:"Toxaphene", returnVal:"toxaphene", selected:true}]
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
                <DropDownSelector title="Filter by Spill Type"
                                onClick={this.onChemTypeChange}
                                buttons={[
                                {title:"Air", returnVal:"air", selected:this.state.air},
                                {title:"Ground", returnVal:"ground", selected:this.state.ground},
                                {title:"Water", returnVal:"water", selected:this.state.water}]}/>
                <DropDownSelector title="Filter by Toxicant"
                                onClick={this.onChemTypeChange}
                                buttons={this.state.tempChemicalButtons} />
        </div>
            ) : null}
    </div>);
        }
}


export default UserControlPanel;