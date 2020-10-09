import "./index.css";
import "../index.css";
import "./DropDownSelector.css"
const React = require("react");
const Component = React.Component;

// selectable options for dropdown sections
class YearDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
        showMenu:null,
        years: [],
    };

    // define the available years
    var i
    var years = []
    for (i=0;i<32;i++)
         {years[i] = i+1987}
    this.state.years = years
  }


  render() {
    return (
      <div>
            <label for="fromYear">Beginning Year:</label>
            <select name="fromYear" id="fromYear"
                onChange={(event)=> this.props.onChange({attribute:"startYear", value:event.target.value})}>
                  {this.state.years.map((year) => (
                                  <option value={year}>{year}</option>
                  ))}
            </select>
            <label for="toYear">End Year:</label>
            <select name="toYear" id="toYear"
                onChange={(event)=> this.props.onChange({attribute:"endYear", value:event.target.value})}>
                  {this.state.years.map((year) => (
                                  <option value={year}>{year}</option>
                  ))}
            </select>
      </div>
    );
  }
}





  export default YearDropdown;