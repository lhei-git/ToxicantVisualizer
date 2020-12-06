import "./index.css";
const React = require("react");

function About(props) {
  return (
    <div className="about-container">
      <div className="background">
        <div className="overlay"></div>
      </div>
      <div className="content">
        <h1>About</h1>
        <div>
          The Visualizer of Environmental Toxicants (VET) web application was
          developed to obtain information from the{" "}
          <a href="https://www.epa.gov/toxics-release-inventory-tri-program">
            Toxic Releases Inventory (TRI)
          </a>{" "}
          data of the U.S. Environmental Protection Agency, and associated
          chemical information from the{" "}
          <a href="https://pubchem.ncbi.nlm.nih.gov">
            PubChem database of the National Library of Medicine
          </a>
          , to map, organize and visualize information about releases of toxic
          chemicals into the air, land and water across the United States.
        </div>
        <div>
          This tool was created to expand knowledge about environmental
          pollutants and enable the public, scientists and policymakers to learn
          about patterns of releases of toxic chemicals into the air, land and
          water, and how these releases may be affecting communities across the
          U.S.
        </div>
        <div>
          Toxicity is a complex issue, and the hazards of a chemical are
          dependent on amount and concentration of the chemical, among other
          factors. This tool is thus for exploratory purposes only, and it is
          not intended to diagnose any particular disease or prescribe any
          particular treatment. Further documentation about the variables used
          here are found under the{" "}
          <a href="https://www.epa.gov/toxics-release-inventory-tri-program/what-toxics-release-inventory">
            TRI documentation
          </a>{" "}
          and the PubChem website.
        </div>
        <div>
          VET was developed for the Lab for Health and Environmental Information
          (LHEI) at Wayne State University by Evan de Jesus, Adwait Wadekar,
          Richard Moore, and Calvin Brooks as part of their Senior Capstone
          Project, during the Fall of 2020. The project was guided by Nic
          DePaula, Director of LHEI and Assistant Professor at the School of
          Information Sciences at Wayne State University.
        </div>
        <div className="credits">
          <span>
            Home page photo by{" "}
            <a href="https://unsplash.com/@punkidu?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">
              Ella Ivanescu
            </a>{" "}
            on{" "}
            <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">
              Unsplash
            </a>
          </span>
          <br />
          <span>
            About page photo by{" "}
            <a href="https://unsplash.com/@worldsbetweenlines?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">
              Patrick Hendry
            </a>{" "}
            on{" "}
            <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">
              Unsplash
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default About;
