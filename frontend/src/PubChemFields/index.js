import "../index.css";
const axios = require("axios");
const React = require("react");
const Component = React.Component;

class PubChemFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cid: null,
      formula: null,
      pharmacology: null,
      hazardStatements: [],
      toxicity: [],
      toxicityHeader: null,
      pictograms: [],
    };
  }

  updateItem(state) {
    this.setState(state);
  }

  //gets chemical CID and molecular formula from PUG REST data
  getPugRestData(chemName) {
    axios
      .get(
        "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/" +
          chemName +
          "/property/MolecularFormula/JSON"
      )
      .then((response) => {
        this.setState({
          cid: response.data.PropertyTable.Properties[0].CID,
          formula: response.data.PropertyTable.Properties[0].MolecularFormula,
        });
        this.getPugViewData();
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
    )
      this.getPugRestData(this.props.chemName);
  }

  render() {
    return (
      <div className="pubChemFields">
        {this.props.chemName != null}
        {
          <div>
            <h1>{this.props.chemName}</h1>
            {this.state.formula}
          </div>
        }

        {this.state.pharmacology != null && (
          <div>
            <h2>Pharmacology</h2>
            {this.state.pharmacology}
          </div>
        )}

        {this.state.hazardStatements[0] != null && (
          <div>
            <h2>Hazard Statements</h2>
            {this.state.hazardStatements.map((v, i) => {
              return <ul key={i}>{v}</ul>;
            })}
          </div>
        )}
        {this.state.pictograms[0] != null && (
          <div>
            {this.state.pictograms.map((v, i) => {
              return <img src={v} alt=""></img>;
            })}
          </div>
        )}

        {this.state.toxicityHeader != null && (
          <div>
            <h2>{this.state.toxicityHeader}</h2>
            {this.state.toxicity.map((v, i) => {
              return <ul key={i + 1}>{v}</ul>;
            })}
          </div>
        )}
      </div>
    );
  }
}

export default PubChemFields;
