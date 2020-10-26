import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";

import axios from 'axios';
const React = require("react");
const Component = React.Component;

// TEMP list of states used to get state data from backend
const states = [ "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI",
                "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO",
                "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA",
                "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", 'WI', "WY"]

class ThematicMapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      stateData: [],
      statesLoaded: false,
    };
   //this.getStateData = this.getStateData.bind(this);
   this.

   //this.getStateData();
  }

handleContent(){}

render(){
  return (
    <div>
      <ThematicMap setTooltipContent={this.handleContent()} data={this.state.stateData}/>
      <ReactTooltip>{this.state.content}</ReactTooltip>
    </div>
  );
}
}

//loads the state data from the backend
async function getStateData()
{
alert("getting state data")

 var d = []

    for (var i = 0; i < states.length; i++)
        {
            await axios.get(
              "http://localhost:8000/stats/state/summary?state=mi")                              //TODO: CHANGE ME TO THE CORRECT LINK
              .then((response) => {
              d.push({name: states[i], total: response.data.totalonsite})
              })
              .catch();
            };

    this.setState({statesLoaded: true});
    return [];
}




export default ThematicMapView