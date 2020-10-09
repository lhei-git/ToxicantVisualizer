import "./index.css";
import "../index.css";
import ChemTypeSelector from './ChemTypeSelector.js'
import DropDownSelector from './DropDownSelector.js'
import YearDropdown from './YearDropdown.js'
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
        startYear: null,
        endYear: null,

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
                <YearDropdown title="Filter by Year" onChange={this.onChemTypeChange}/>
                <DropDownSelector title="Filter by Toxicant Type"
                                onClick={this.onChemTypeChange}
                                buttons={[
                                {title:"Dioxins", returnVal:"dioxins", selected:this.state.air},
                                {title:"Carcinogens", returnVal:"carcinogens", selected:this.state.ground},
                                {title:"Other Toxicants", returnVal:"otherChems", selected:this.state.water}]}/>
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