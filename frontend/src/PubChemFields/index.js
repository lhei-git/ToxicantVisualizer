import "../index.css";
import "./index.css";
const { formatChemical } = require("../helpers");
const pubchem = require("../api/pubchem/index");
const React = require("react");
const Component = React.Component;

/* Pharmacology */
function Pharmacology(props) {
  const [pubchemData, setPubchemData] = React.useState(null);

  React.useEffect(() => {
    if (!pubchemData && props.cid) getPubchemData(props.cid);
  });

  async function getPubchemData(cid) {
    try {
      const response = await pubchem.get(
        "/pug_view/data/compound/" + cid + "/JSON?heading=Pharmacology"
      );
      const res =
        response.data.Record.Section[0].Section[0].Information[0].Value
          .StringWithMarkup[0].String;
      setPubchemData(res);
    } catch (err) {
      console.log(err);
    }
  }

  return pubchemData !== null ? (
    <div className="pharmacology">
      <h2>Pharmacology</h2>
      {pubchemData}
    </div>
  ) : (
    <div></div>
  );
}

function HazardStatements(props) {
  const [pubchemData, setPubchemData] = React.useState(null);

  React.useEffect(() => {
    if (!pubchemData && props.cid) {
      getPubchemData();
    }
  });

  async function getPubchemData() {
    try {
      const response = await pubchem.get(
        "/pug_view/data/compound/" +
          props.cid +
          "/JSON?heading=GHS+Classification"
      );
      const data = parseGHSData(response);
      setPubchemData(data);
    } catch (err) {
      console.log(err);
    }
  }

  function parseGHSData(response) {
    const info =
      response.data.Record.Section[0].Section[0].Section[0].Information;
    var pictograms = [];
    var statements = [];

    pictograms = info[0].Value.StringWithMarkup[0].Markup.map((pic) => pic.URL);
    statements = info[2].Value.StringWithMarkup.map((st) => st.String);

    const parsed = { pictograms: pictograms, hazardStatements: statements };
    return parsed;
  }

  return (
    pubchemData !== null && (
      <div className="hazards">
        <h2>Hazard Statements</h2>
        <div className="pictograms">
          {pubchemData.pictograms.map((v, i) => {
            return <img src={v} alt="" key={JSON.stringify(v)}></img>;
          })}
        </div>
        <ul>
          {pubchemData.hazardStatements.map((v, i) => {
            return <li key={JSON.stringify(v)}>{v}</li>;
          })}
        </ul>
      </div>
    )
  );
}

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
      isLoading: false,
    };
    this.Content = this.Content.bind(this);
  }

  //gets chemical CID and molecular formula from PUG REST data
  getPugRestData(chemName) {
    chemName = formatChemical(chemName);
    let state = {};
    let cid = null;
    pubchem
      .get(
        "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/" +
          chemName +
          "/property/MolecularFormula/JSON"
      )
      .then((response) => {
        cid = response.data.PropertyTable.Properties[0].CID;
        state = {
          cid,
          formula: response.data.PropertyTable.Properties[0].MolecularFormula,
        };
        return pubchem.get(
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
        console.log(err);
      });
  }

  //gets Pharmacology, Chemical Safety, GHS hazard statements, and Toxicity data from PUG VIEW data
  getPugViewData() {
    //PHARMACOLOGY
    // pubchem
    //   .get(
    //     "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/" +
    //       this.state.cid +
    //       "/JSON?heading=Pharmacology"
    //   )
    //   .then((response) =>
    //     this.setState({
    //       pharmacology:
    //         response.data.Record.Section[0].Section[0].Information[0].Value
    //           .StringWithMarkup[0].String,
    //     })
    //   )
    //   .catch((response) => this.setState({ pharmacology: null }));

    //HAZARD STATEMENTS AND PICTOGRAMS
    // pubchem
    //   .get(
    //     "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/" +
    //       this.state.cid +
    //       "/JSON?heading=GHS+Classification"
    //   )
    //   .then((response) => this.parseGHSData(response))
    //   .catch((response) => this.setState({ hazardStatement: null }));

    //TOXICITY
    pubchem
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
      });
      this.getPugRestData(this.props.chemName);
    }
  }

  /* Composition of all sections */
  Content(props) {
    return (
      <div className="pubChemFields">
        {props.chemName !== "" && (
          <div className="name">
            <h1>{props.chemName}</h1>
          </div>
        )}
        {this.state.description !== null && <div>{this.state.description}</div>}
        {this.state.cid && (
          <div>
            <Pharmacology cid={this.state.cid}></Pharmacology>
            <HazardStatements cid={this.state.cid}></HazardStatements>
          </div>
        )}

        {/* {this.state.hazardStatements.length > 0 && (
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
          )} */}
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

  render() {
    return (
      <this.Content
        chemName={formatChemical(this.props.chemName)}
      ></this.Content>
    );
  }
}

export default PubChemFields;
