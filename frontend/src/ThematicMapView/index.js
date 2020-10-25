import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";
import { createContext , useState, useEffect} from "react";
import axios from 'axios';
const React = require("react");


// TEMP list of states used to get state data from backend
const states = [ "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI",
                "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO",
                "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA",
                "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", 'WI', "WY"]


function ThematicMapView() {
  const [content, setContent] = useState("");
  const [stateData, setStateData] = useState(GetStateData());   //load the state data from the backend
  const [statesLoaded, setStatesLoaded] = useState(false);      //set states loaded to false by default so that loading message can be displayed

  this.GetStateData = this.GetStateData.bind(this);

  this.getStateData(setStatesLoaded())

  return (
    <div>
      <ThematicMap setTooltipContent={setContent} data={useEffect(stateData)}/>
      <ReactTooltip>{content}</ReactTooltip>
    </div>
  );
}

//loads the state data from the backend
async function GetStateData(setStatesLoaded)
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

    setStatesLoaded(true);
    return [];
}




export default ThematicMapView