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
        newFilters: false,
        filters: {
        dioxin: true,
        carcinogen: true,
        pbt: true,
        air: true,
        ground: true,
        water: true,
        cleanairact: true,
        year: 2018, //default latest year
        },

        // temporary array of chemicals to populate list
        /*tempChemicalButtons : [{title:"Ammonia", returnVal:"ammonia", selected:true},
                               {title:"Styrene", returnVal:"styrene", selected:true},
                               {title:"Florine", returnVal:"florine", selected:true},
                               {title:"Benzene", returnVal:"benzene", selected:true},
                               {title:"Formaldehyde", returnVal:"formaldehyde", selected:true},
                               {title:"Toxaphene", returnVal:"toxaphene", selected:true}]*/
    };

    this.onChange = this.onChange.bind(this);
    this.togglePanel = this.togglePanel.bind(this);
  }

  // checks to see if a new filter has been applied when the panel's state changes
  componentDidUpdate()
  {
    if(this.state.newFilters)
    {
        this.setState({newFilters:false})
        var returnFilters =[];

        //return boolean filters which are active (filtered out)
        //doesn't include numerical values (i.e. date)
        Object.entries(this.state.filters).map((item) => {
            if(item[1] === false)
                { returnFilters.push({[item[0]]:"NO"}) }
        })

        //push the year to the array separately
        returnFilters.push({year:this.state.filters.year})

        this.props.onFilter(returnFilters)
        }
  }

  onChange(event) {
         this.setState(prevState => ({
          filters: {
            ...prevState.filters,
             [event.attribute]:   event.value}
        })
        )

        this.setState({newFilters:true})
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
                <YearDropdown title="Filter by Year:  " onChange={this.onChange} year={this.state.filters.year}/>
                <DropDownSelector title="Filter by Toxicant Type"
                                onClick={this.onChange}
                                buttons={[
                                {title:"Clean Air Act", returnVal:"cleanairact", selected:this.state.filters.cleanairact},
                                {title:"Dioxins", returnVal:"dioxin", selected:this.state.filters.dioxin},
                                {title:"Carcinogens", returnVal:"carcinogen", selected:this.state.filters.carcinogen},
                                {title:"PBTs", returnVal:"pbt", selected:this.state.filters.pbt}]}/>
                <DropDownSelector title="Filter by Spill Type"
                                onClick={this.onChange}
                                buttons={[
                                {title:"Air", returnVal:"air", selected:this.state.filters.air},
                                {title:"Ground", returnVal:"ground", selected:this.state.filters.ground},
                                {title:"Water", returnVal:"water", selected:this.state.filters.water}]}/>
                {/*

                This section was used to create the toxicant filter dropdown

                <DropDownSelector title="Filter by Toxicant"
                                onClick={this.onChange}
                                buttons={this.state.tempChemicalButtons} />
                */}

        </div>
            ) : null}
    </div>);
        }
}


export default UserControlPanel;