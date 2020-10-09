import "./index.css";
import "../index.css";
import "./DropDownSelector.css"
import SelectionButton from './SelectionButton.js'
const React = require("react");
const Component = React.Component;

// Header for dropdown selector
class DropDownSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      title: null,
      buttons: null,
      selected: false,
    };
        this.state.buttons = this.props.buttons;
        this.state.title = this.props.title;
        this.toggleMenu = this.toggleMenu.bind(this);

        //check to see if any options are selected
        this.state.buttons.forEach(e => {
        if (e.selected == false) this.state.selected = true
        })
  }

  toggleMenu(e){
    this.setState({showMenu: !this.state.showMenu})
  }

  handleChange(event, index)
  {
    this.state.buttons[event.index].selected = !this.state.buttons[event.index].selected

    //check to see if any options are selected
    this.state.selected = false
    this.state.buttons.forEach(e => {
    if (e.selected == false) this.state.selected = true
    })

    this.props.onClick(event)
  }

  render() {
    return (
      <div>
             {
          this.state.selected
            ? (
        <button class="categorySelected" onClick={this.toggleMenu}>
          {this.state.title}
        </button>
                    )
            : (
          <button class="categoryDeselected" onClick={this.toggleMenu}>
          {this.state.title}
           </button>
            )
            }

        {
          this.state.showMenu
            ? (
              <div
                className="menu"
                ref={(element) => {
                  this.dropdownMenu = element;
                }}
              >
                  {this.state.buttons.map((item, i) => (
                    <SelectionButton item={item} index={i} onClick={(event)=> this.handleChange(event)}/>
                  ))}

              </div>
            )
            : (
              null
            )
        }
      </div>
    );
  }
}

export default DropDownSelector;


