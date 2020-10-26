import "../index.css";
import "./index.css";
const { formatChemical } = require("../helpers");
const pubchem = require("../api/pubchem/index");
const React = require("react");
const Component = React.Component;

function Link(props) {
  return (
    <div className="link-icon">
      <img src={require("./../../src/assets/openlink.png")} alt="" />
    </div>
  );
}

/* Pharmacology Component */
function Pharmacology(props) {
  const [pubchemData, setPubchemData] = React.useState(null);
  const link = `https://pubchem.ncbi.nlm.nih.gov/compound/${
    props.cid || 0
  }#section=Pharmacology`;

  // fetches data when component is updated
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
      <a href={link}>
        <h2>
          Pharmacology
          <Link href={link} />
        </h2>
      </a>
      {pubchemData}
    </div>
  ) : (
    <div></div>
  );
}

/* Hazards and Pictograms Component */
function HazardStatements(props) {
  const [pubchemData, setPubchemData] = React.useState(null);
  const link = `https://pubchem.ncbi.nlm.nih.gov/compound/${props.cid}#section=Safety-and-Hazards`;

  // fetches data when component is updated
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
    var hazardStatements = [];

    // pictograms: first element of Information Array
    pictograms = info[0].Value.StringWithMarkup[0].Markup.map((pic) => pic.URL);
    // pictograms: third element of Information Array
    hazardStatements = info[2].Value.StringWithMarkup.map((st) => st.String);

    return { pictograms, hazardStatements };
  }

  return (
    pubchemData !== null && (
      <div className="hazards">
        <a href={link}>
          <h2>
            Hazard Statements
            <Link href={link} />
          </h2>
        </a>
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

/* Evidence for Carcinogenicity Component */
function Toxicity(props) {
  const [header, setHeader] = React.useState(null);
  const [pubchemData, setPubchemData] = React.useState(null);
  const link = `https://pubchem.ncbi.nlm.nih.gov/compound/${
    props.cid || 0
  }#section=Toxicity`;

  // fetches data when component is updated
  React.useEffect(() => {
    if (!pubchemData && props.cid) {
      getPubchemData();
    }
  });

  async function getPubchemData() {
    try {
      const response = await pubchem.get(
        `/pug_view/data/compound/${props.cid}/JSON?heading=Toxicological+Information`
      );
      const data = parseToxicityData(response);
      setPubchemData(data);
    } catch (err) {
      console.log(err);
    }
  }

  function parseToxicityData(response) {
    var toxicity = [];

    //grab the section heading to be displayed
    const TOCHeading =
      response.data.Record.Section[0].Section[0].Section[1].TOCHeading;
    setHeader(TOCHeading);

    const info =
      response.data.Record.Section[0].Section[0].Section[1].Information;

    toxicity = info
      .map((t) => t.Value.StringWithMarkup[0].String)
      .filter((t) => t.toUpperCase() !== "NOT LISTED");

    return { toxicity };
  }

  return (
    pubchemData !== null &&
    header !== null &&
    pubchemData.toxicity.length !== 0 && (
      <div className="toxicity">
        <a href={link}>
          <h2>
            {header}
            <Link href={link} />
          </h2>
        </a>

        <ul>
          {pubchemData.toxicity.map((v, i) => {
            return <li key={"toxicity-" + i}>{v}</li>;
          })}
        </ul>
      </div>
    )
  );
}

/* Main class that fetches data on creation and renders all Pubchem components */
class PubChemFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cid: null,
      formula: null,
      description: null,
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
      .get("pug/compound/name/" + chemName + "/property/MolecularFormula/JSON")
      .then((response) => {
        cid = response.data.PropertyTable.Properties[0].CID;
        state = {
          cid,
          formula: response.data.PropertyTable.Properties[0].MolecularFormula,
        };
        return pubchem.get("/pug/compound/cid/" + cid + "/Description/JSON");
      })
      .then((response) => {
        if (response.data.InformationList.Information.length > 1)
          state.description =
            response.data.InformationList.Information[1].Description;
        this.setState(state);
      })
      .catch((err) => {
        console.log(err);
      });
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
        {/*gets Pharmacology, Chemical Safety, GHS hazard statements, and Toxicity data from PUG VIEW data */}
        {this.state.cid && (
          <div>
            <Pharmacology cid={this.state.cid}></Pharmacology>
            <HazardStatements cid={this.state.cid}></HazardStatements>
            <Toxicity cid={this.state.cid}></Toxicity>
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
