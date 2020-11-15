import "../index.css";
import "./index.css";
import LoadingSpinner from "../LoadingSpinner";
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

function handleError(err) {
  /* do something here */
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
  }, []);

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
      handleError(err);
    } finally {
      console.log("pharmacology loaded");
      props.onLoad();
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
  }, []);

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
      handleError(err);
    } finally {
      console.log("hazardStatements loaded");
      props.onLoad();
    }
  }

  function parseGHSData(response) {
    const info =
      response.data.Record.Section[0].Section[0].Section[0].Information;
    var pictograms = [];
    var hazardStatements = [];

    // pictograms: first element of Information Array
    pictograms = info[0].Value.StringWithMarkup[0].Markup.map((pic) => ({
      description: pic.Extra || "unknown",
      href: pic.URL,
    }));
    // pictograms: third element of Information Array
    hazardStatements = info[2].Value.StringWithMarkup.map((st) => st.String);
    return { pictograms, hazardStatements };
  }

  return (
    pubchemData !== null && (
      <div className="hazards">
        <a href={link}>
          <h2>
            Hazards
            <Link href={link} />
          </h2>
        </a>
        <div className="pictograms">
          {pubchemData.pictograms.map((v, i) => {
            return (
              <div className="pictogram" key={v.description}>
                <img src={v.href} alt="" key={v.description}></img>{" "}
                <span className="tooltiptext">{v.description}</span>
              </div>
            );
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
  }, []);

  async function getPubchemData() {
    try {
      const response = await pubchem.get(
        `/pug_view/data/compound/${props.cid}/JSON?heading=Toxicological+Information`
      );
      const data = parseToxicityData(response);
      setPubchemData(data);
    } catch (err) {
      handleError(err);
    } finally {
      console.log("toxicity loaded");
      props.onLoad();
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

/* Composition of all sections */
function Content(props) {
  const numComponents = 3;
  const [loaded, setLoaded] = React.useState(false);
  const [numLoaded, setNumLoaded] = React.useState(0);

  function increment() {
    setNumLoaded((numLoaded) => numLoaded + 1);
    // console.log("numLoaded :>> ", numLoaded);
  }

  React.useEffect(() => {
    // console.log('numLoaded :>> ', numLoaded);
    if (numLoaded === numComponents && !loaded) {
      setLoaded(true);
    }
  }, [loaded, numLoaded]);

  return (
    <div>
      {!loaded && (
        <div className="loading-overlay">
          <div className="spinner">
            <LoadingSpinner></LoadingSpinner>
          </div>
        </div>
      )}
      <div className={`pubChemFields ${loaded ? "" : "loading"}`}>
        {props.chemName !== "" && (
          <div className="name">
            <h1>{props.chemName}</h1>
          </div>
        )}
        {props.description !== null && <div>{props.description}</div>}
        {/*gets Pharmacology, Chemical Safety, GHS hazard statements, and Toxicity data from PUG VIEW data */}
        {props.cid && (
          <div className="loaded-content">
            <Pharmacology cid={props.cid} onLoad={increment}></Pharmacology>
            <HazardStatements
              cid={props.cid}
              onLoad={increment}
            ></HazardStatements>
            <Toxicity cid={props.cid} onLoad={increment}></Toxicity>
            {/* <div className="diseases">
              <div
                dangerouslySetInnerHTML={{
                  __html: '<iframe src="https://pubchem.ncbi.nlm.nih.gov/compound/5352425#section=Associated-Disorders-and-Diseases&fullscreen=true" width="540" height="450"></iframe>',
                }}
              ></div>
            </div> */}
          </div>
        )}
      </div>
    </div>
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
      isLoading: true,
    };
  }

  //gets chemical CID and molecular formula from PUG REST data
  async getPugRestData(chemName) {
    try {
      chemName = formatChemical(chemName);
      let state = {};
      let cid = null;
      const nameResponse = await pubchem.get(
        `pug/compound/name/${chemName}/property/MolecularFormula/JSON`
      );

      cid = nameResponse.data.PropertyTable.Properties[0].CID;
      state = {
        cid,
        formula: nameResponse.data.PropertyTable.Properties[0].MolecularFormula,
      };
      const CidResponse = await pubchem.get(
        `/pug/compound/cid/${cid}/Description/JSON`
      );

      if (CidResponse.data.InformationList.Information.length > 1)
        state.description =
          CidResponse.data.InformationList.Information[1].Description;
      this.setState(state);
    } catch (err) {
      console.log(`err: "${chemName}" not found`);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async componentDidMount() {
    if (this.props.chemName !== "")
      await this.getPugRestData(this.props.chemName);
  }

  /* UPDATE HOOK NOT NEEDED as this component is recreated on each chemical click. 
  TODO: prevent component recreation */

  render() {
    return this.state.cid || this.state.isLoading ? (
      <Content
        description={this.state.description}
        cid={this.state.cid}
        chemName={formatChemical(this.props.chemName)}
      ></Content>
    ) : (
      <div>Pubchem data for {this.props.chemName} could not be found.</div>
    );
  }
}

export default PubChemFields;
