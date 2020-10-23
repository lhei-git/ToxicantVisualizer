import "./index.css";
import "../index.css";
const React = require("react");
const Component = React.Component;

//chemical type check boxes
class ChemTypeSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      attribute: null,
      title: null,
      defaultChecked: null,
    };
    this.state.title = this.props.title;
    this.state.attribute = this.props.attribute;
    this.state.defaultChecked = this.props.defaultChecked;
  }

  render() {
    return (
      <div className="selector">
        {this.state.title}
        <input
          type="checkbox"
          attribute={this.props.attribute}
          defaultChecked={this.state.defaultChecked}
          onClick={(event) =>
            this.props.onClick({
              attribute: this.state.attribute,
              value: event.target.checked,
            })
          }
        />
      </div>
    );
  }
}

export default ChemTypeSelector;
