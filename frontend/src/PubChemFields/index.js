import "../index.css";
import "./index.css";
const { getChemical } = require("../helpers");
const axios = require("axios");
const React = require("react");
const Component = React.Component;

class PubChemFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cid: null,
      formula: null,
      description: null,
      pharmacology: null,
      hazardStatements: [],
      toxicity: [],
      toxicityHeader: null,
      pictograms: [],
      chemicalNotFound: false,
    };
    this.Content = this.Content.bind(this);
  }

  updateItem(state) {
    this.setState(state);
  }

  //gets chemical CID and molecular formula from PUG REST data
  getPugRestData(chemName) {
    chemName = getChemical(chemName);
    let state = {};
    let cid = null;
    axios
      .get(
        "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/" +
          chemName +
          "/property/MolecularFormula/JSON"
      )
      .then((response) => {
        // this.setState({
        //   cid: response.data.PropertyTable.Properties[0].CID,
        //   formula: response.data.PropertyTable.Properties[0].MolecularFormula,
        // });
        cid = response.data.PropertyTable.Properties[0].CID;
        state = {
          cid,
          formula: response.data.PropertyTable.Properties[0].MolecularFormula,
        };
        return axios.get(
          "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" +
            cid +
            "/Description/JSON"
        );
      })
      .then((response) => {
        if (response.data.InformationList.Information.length > 1)
          state.description =
            response.data.InformationList.Information[1].Description;
        this.setState(state);
        return this.getPugViewData();
      })
      .catch((err) => {
        this.setState({
          chemicalNotFound: true,
        });
        console.log(err);
      });
  }

  //gets Pharmacology, Chemical Safety, GHS hazard statements, and Toxicity data from PUG VIEW data
  getPugViewData() {
    //PHARMACOLOGY
    axios
      .get(
        "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/" +
          this.state.cid +
          "/JSON?heading=Pharmacology"
      )
      .then((response) =>
        this.setState({
          pharmacology:
            response.data.Record.Section[0].Section[0].Information[0].Value
              .StringWithMarkup[0].String,
        })
      )
      .catch((response) => this.setState({ pharmacology: null }));

    //HAZARD STATEMENTS AND PICTOGRAMS
    axios
      .get(
        "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/" +
          this.state.cid +
          "/JSON?heading=GHS+Classification"
      )
      .then((response) => this.parseGHSData(response))
      .catch((response) => this.setState({ hazardStatement: null }));

    //TOXICITY
    axios
      .get(
        "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/" +
          this.state.cid +
          "/JSON?heading=Toxicological+Information"
      )
      //.then((response) => alert(response.data.Record.Section[0].Section[0].Section[1].TOCHeading))
      .then((response) => this.parseToxicityData(response))
      .catch((response) => this.setState({ hazardStatement: null }));
  }

  parseToxicityData(response) {
    var toxicity = [];

    //grab the section heading to be displayed
    this.setState({
      toxicityHeader:
        response.data.Record.Section[0].Section[0].Section[1].TOCHeading,
    });

    //grab the first 4 statements
    for (var i = 0; i < 3; i++)
      if (
        typeof response.data.Record.Section[0].Section[0].Section[1]
          .Information[i].Value.StringWithMarkup[0].String !== undefined
      )
        toxicity.push(
          response.data.Record.Section[0].Section[0].Section[1].Information[i]
            .Value.StringWithMarkup[0].String
        );

    this.setState({ toxicity: toxicity });
  }

  parseGHSData(response) {
    var pictograms = [];
    var statements = [];

    //grab the first 3 pictograms
    for (var i = 0; i < 3; i++)
      if (
        typeof response.data.Record.Section[0].Section[0].Section[0]
          .Information[0].Value.StringWithMarkup[0].Markup[i].URL !== undefined
      )
        pictograms.push(
          response.data.Record.Section[0].Section[0].Section[0].Information[0]
            .Value.StringWithMarkup[0].Markup[i].URL
        );

    //grab the first 4 GHS hazard statements
    for (i = 0; i < 4; i++)
      if (
        typeof response.data.Record.Section[0].Section[0].Section[0]
          .Information[2].Value.StringWithMarkup[i].String !== undefined
      )
        statements.push(
          response.data.Record.Section[0].Section[0].Section[0].Information[2]
            .Value.StringWithMarkup[i].String
        );

    this.setState({ pictograms: pictograms, hazardStatements: statements });
  }

  componentDidMount() {
    if (this.props.chemName !== "") this.getPugRestData(this.props.chemName);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.chemName !== "" &&
      prevProps.chemName !== this.props.chemName
    ) {
      this.setState({
        cid: null,
        formula: null,
        description: null,
        pharmacology: null,
        hazardStatements: [],
        toxicity: [],
        toxicityHeader: null,
        pictograms: [],
        chemicalNotFound: false,
      });
      this.getPugRestData(this.props.chemName);
    }
  }

  Content(props) {
    const notFound = props.notFound;
    if (notFound) {
      return <h2>Data for {props.chemName} could not be found.</h2>;
    } else {
      return (
        <div className="pubChemFields">
          {props.chemName !== "" && (
            <div className="name">
              <h1>{props.chemName}</h1>
            </div>
          )}
          {this.state.description !== null && (
            <div>{this.state.description}</div>
          )}
          {this.state.pictograms.length > 0 && (
            <div className="pictograms">
              {this.state.pictograms.map((v, i) => {
                return <img src={v} alt="" key={v + "-" + i}></img>;
              })}
            </div>
          )}
          {this.state.pharmacology !== null && (
            <div className="pharmacology">
              <h2>Pharmacology</h2>
              {this.state.pharmacology}
            </div>
          )}
          {this.state.hazardStatements.length > 0 && (
            <div className="hazards">
              <h2>Hazard Statements</h2>
              {this.state.hazardStatements.map((v, i) => {
                return (
                  <ul>
                    <li key={"hazards-" + i}>{v}</li>
                  </ul>
                );
              })}
            </div>
          )}
          {this.state.toxicityHeader !== null &&
            this.state.toxicity.length !== 0 && (
              <div className="toxicity">
                <h2>{this.state.toxicityHeader}</h2>
                {this.state.toxicity.map((v, i) => {
                  return (
                    <ul>
                      <li key={"toxicity-" + i}>{v}</li>
                    </ul>
                  );
                })}
              </div>
            )}
        </div>
      );
    }
  }

  render() {
    return (
      <this.Content
        chemName={getChemical(this.props.chemName)}
        notFound={this.state.chemicalNotFound}
      ></this.Content>
    );
  }
}

export default PubChemFields;
