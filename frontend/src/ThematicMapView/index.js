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

//state map topo data
const stateGeoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers.json"
const countyGeoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers-counties.json"

class ThematicMapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      stateData: null,
      stateMax: null,
      stateMin: null,
      countyData: null,
      countyMax: null,
      countyMin: null,
    };
    this.handleContent = this.handleContent.bind(this);
    this.getStateData = this.getStateData.bind(this);
    this.getCountyData = this.getCountyData.bind(this);

  }

  componentDidMount(){
   this.getStateData();
   this.getCountyData();
  }

handleContent(content){
    this.setState({content:content})
}



render(){
return(
<>
    <div style={{height: 1600}}>
    <h1>State Data</h1>
      {this.state.stateData ? (
        <>
        <ThematicMap
                setTooltipContent={this.handleContent}
                data={this.state.stateData}
                maxValue={this.state.stateMax}
                minValue={this.state.stateMin}
                geoUrl={stateGeoUrl}
                type={"states"}/>
                <ReactTooltip multiline={true} html={true}>{this.state.content}</ReactTooltip>
                </>
      ) : (
         <LoadSpinner/>
      )}
    </div>

    <div>
    <h1>County Data</h1>
      {this.state.countyData ? (
        <>
          <ThematicMap
                setTooltipContent={this.handleContent}
                data={this.state.countyData}
                maxValue={this.state.countyMax}
                minValue={this.state.countyMin}
                geoUrl={countyGeoUrl}
                type={"counties"}/>
          <ReactTooltip multiline={true} html={true}>{this.state.content}</ReactTooltip>
                </>
      ) : (
         <LoadSpinner/>
      )}
    </div>
    </>
)

}

async getCountyData()
{
    var l = {}
    var d = [];
    var maxValue = 0;
    var minValue = 100000000000000;
    await axios.get(
              "http://localhost:8000/stats/county/all")              //TODO: CHANGE ME TO THE CORRECT LINK
    .then((response) => {l = response.data
                         d = Object.values(l)
                         response.data.map ( (totalonsite, i) => {
                            if(response.data[i].totalonsite > maxValue) maxValue = response.data[i].totalonsite
                            if(response.data[i].totalonsite < minValue && response.data[i].totalonsite != 0) minValue = response.data[i].totalonsite
                            })
                         this.setState({countyData:d, countyMin: minValue, countyMax:maxValue})
                         })
}

async  getStateData()
{
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




// loading animation
function LoadSpinner()
{
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

export default ThematicMapView