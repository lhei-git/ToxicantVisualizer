import "../index.css";
import "./index.css";
import LoadingSpinner from "../LoadingSpinner";
import PropTypes from "prop-types";
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

  const { onLoad } = props;
  // fetches data when component is updated
  React.useEffect(() => {
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
        onLoad();
      }
    }

    if (props.cid) getPubchemData(props.cid);
  }, []);

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

  const { onLoad } = props;
  // fetches data when component is updated
  React.useEffect(() => {
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
        onLoad();
      }
    }

    if (!pubchemData && props.cid) {
      getPubchemData();
    }
  }, []);

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
                <div className="description">{v.description}</div>
              </div>
            );
          })}
        </div>
        <ul className="section-content">
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

  const { onLoad } = props;

  // fetches data when component is updated
  React.useEffect(() => {
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
        onLoad();
      }
    }

    if (!pubchemData && props.cid) {
      getPubchemData();
    }
  }, []);

  function parseToxicityData(response) {
    //grab the section heading to be displayed
    const TOCHeading =
      response.data.Record.Section[0].Section[0].Section[1].TOCHeading;
    setHeader(TOCHeading);

    const carcinogenicity = (
      <div>
        {response.data.Record.Section[0].Section[0].Section[1].Information.map(
          (t) => t.Value.StringWithMarkup[0].String
        )
          .filter((t) => t.toUpperCase() !== "NOT LISTED")
          .map((v, i) => {
            return <li key={"toxicity-" + i}>{v}</li>;
          })}
      </div>
    );
    const healthData =
      response.data.Record.Section[0].Section[0].Section[2].Information;
    const healthEffects = (
      <div>
        <ul className="section-content">
          {healthData
            .find((d) => d.Name === "Health Effect Code(s)")
            .Value.StringWithMarkup.map((s) => (
              <li>{s.String}</li>
            ))}
        </ul>
      </div>
    );

    const exposureData =
      response.data.Record.Section[0].Section[0].Section[3].Information;
    const exposureRoutes = (
      <div>
        <ul className="section-content">
          {exposureData.map((s) => (
            <li>{s.Value.StringWithMarkup[0].String}</li>
          ))}
        </ul>
      </div>
    );

    return { carcinogenicity, healthEffects, exposureRoutes };
  }

  return (
    pubchemData !== null &&
    header !== null && (
      <div className="toxicity">
        <a href={link}>
          <h2>
            Toxicity
            <Link href={link} />
          </h2>
        </a>
        {pubchemData.healthEffects !== null && (
          <div>
            <h3>Health Effects</h3>
            {pubchemData.healthEffects}
          </div>
        )}
        {pubchemData.exposureRoutes !== null && (
          <div>
            <h3>Exposure Routes</h3>
            {pubchemData.exposureRoutes}
          </div>
        )}
        {pubchemData.carcinogenicity !== null && (
          <div>
            <h3>Evidence for Carcinogenicity</h3>
            <ul className="section-content">{pubchemData.carcinogenicity}</ul>
          </div>
        )}
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
  }

  React.useEffect(() => {
    if (numLoaded === numComponents && !loaded) {
      setLoaded(true);
    }
    console.log("useEffect");
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
        <div style={{ fontStyle: "italic" }}>Information from PubChem:</div>
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

  render() {
    /* render content only when pubchem has found a candidate compound for the clicked chemical */
    return this.state.cid || this.state.isLoading ? (
      <Content
        description={this.state.description}
        cid={this.state.cid}
        chemName={formatChemical(this.props.chemName)}
      ></Content>
    ) : (
      <div className="oops">
        Pubchem data for {this.props.chemName} could not be found.
      </div>
    );
  }
}
PubChemFields.propTypes = {
  chemName: PropTypes.string.isRequired,
};

export default PubChemFields;
