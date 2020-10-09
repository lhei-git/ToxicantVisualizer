import "./index.css";
import "../index.css";
const React = require("react");
const Component = React.Component;

// selectable options for dropdown sections
class SelectionButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
        selected:null,
    };
        this.state.selected = this.props.item.selected;
  }

  handleChange(event)
  {
    this.setState({selected:!this.state.selected})
    this.props.onClick(event)
  }
  render()
  {
    return(
        <>
        {
        this.state.selected
            ? (
                <button class="buttonSelected"
                    selected = {this.props.item.selected}
                    onClick={(event) => this.handleChange({attribute: this.props.item.returnVal, value:!this.state.selected, index:this.props.index})}>
                    {this.props.item.title}
                </button>
            )
            : (
                <button class="buttonDeselected"
                    selected = {this.props.item.selected}
                    onClick={(event) => this.handleChange({attribute: this.props.item.returnVal, value:!this.state.selected, index:this.props.index})}>
                    {this.props.item.title}
                </button>
            )

        }
        </>
)
  }

}

export default SelectionButton;
