import ReactTooltip from "react-tooltip";
import ThematicMap from "../ThematicMap/index.js";

import Loader from 'react-loader-spinner';

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
      stateData: null,
      stateMax: null,
      stateMin: null,
    };
    this.handleContent = this.handleContent.bind(this);
    this.getStateData = this.getStateData.bind(this);


  }

  componentDidMount(){
   this.getStateData();
  }

handleContent(content){
    this.setState({content:content})
}

render(){
    if (!this.state.stateData) {
    return(
        <div
            style={{
            width: "100%",
            height: "100",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
            }}
        >
            <Loader type="ThreeDots" color="#2BAD60" height="100" width="100" />
        </div>
        )
    }


  return (
    <div>
      <ThematicMap
            setTooltipContent={this.handleContent}
            data={this.state.stateData}
            maxValue={this.state.stateMax}
            minValue={this.state.stateMin}/>
      <ReactTooltip multiline={true} html={true}>{this.state.content}</ReactTooltip>
    </div>
  );
}


//loads the state data from the backend
//async  getStateData()
//{
//
//
// var d = []
//
//    for (var i = 0; i < states.length; i++)
//        {
//            await axios.get(
//              "http://localhost:8000/stats/state/summary?state=mi")                              //TODO: CHANGE ME TO THE CORRECT LINK
//              .then((response) => {
//              d.push({name: states[i], total: response.data.totalonsite})
//              })
//              .catch((e) => alert(e));
//            };
//
//    this.setState({statesLoaded: true});
//    this.setState({stateData: d});
//    return d;
//}

async  getStateData()
{
/////// THIS SECTION OF CODE WAS USED BEFORE CREATING A NEW ENDPOINT AND IS MODERATELY SLOWER
//    var d= [];
//    var maxValue = 0;
//    var minValue = 100000000000000;
//    let promises = [];
//    for (var i = 0; i < states.length; i++) {
//
//      await axios.get(
//              "http://localhost:8000/stats/state/summary?state=" + states[i])
//              .then((response) => {
//              d.push({name: states[i], total: response.data.totalonsite, air: response.data.air, water: response.data.water, land: response.data.land, offsite: response.data.totaloffsite,
//                                        dioxins: response.data.totaldioxin, carcinogens: response.data.totalcarcs, facilities: response.data.numtrifacilities })
//
//              if(response.data.totalonsite > maxValue) maxValue = response.data.totalonsite;
//              if(response.data.totalonsite < minValue && response.data.totalonsite != 0) minValue = response.data.totalonsite;
//
//              })
//              .catch((e) => alert(e));
//            };
//
//    Promise.all(promises).then(() => this.setState({stateData: d, stateMax: maxValue, stateMin: minValue}));

    var l = {}
    var d = [];
    var maxValue = 0;
    var minValue = 100000000000000;
    await axios.get(
              "http://localhost:8000/stats/state/all")              //TODO: CHANGE ME TO THE CORRECT LINK
    .then((response) => {l = response.data
                         d = Object.values(l)
                         response.data.map ( (totalonsite, i) => {
                            if(response.data[i].totalonsite > maxValue) maxValue = response.data[i].totalonsite
                            if(response.data[i].totalonsite < minValue && response.data[i].totalonsite != 0) minValue = response.data[i].totalonsite
                            })

                         this.setState({stateData:d, stateMin: minValue, stateMax:maxValue})
                         })
}

}


export default ThematicMapView