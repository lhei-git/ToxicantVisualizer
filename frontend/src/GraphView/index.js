import "./index.css";
const React = require("react");

function DropdownIcon() {
  return (
    <svg
    className="dropdown-icon"
      height="50px"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 100 100 L 400 100 L 250 300 z"
        fill="#FFF"
      />
    </svg>
  );
}

function GraphView() {
  return (
    <div className="graph-container">
      <div className="graph-dropdown">
        Summary
        <DropdownIcon />
      </div>
      <div className="graph-dropdown">
        Total releases (on-site+off-site) for top 10 facilities (in lbs)
        <DropdownIcon />
      </div>
      <div className="graph-dropdown">
        Total Releases for the top 10 parent companies (in lbs)
        <DropdownIcon />
      </div>
    </div>
  );
}

export default GraphView;
