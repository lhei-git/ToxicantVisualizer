import './Sidebar.css';
const React = require('react');
const Component = React.Component;

class Sidebar extends Component {

    render(props) {
        return (
            <div className="container">
                <SearchField
                   onSearch={ () => this.props.onSearch() }
                   />
            </div>
        )
    }
}

class SearchField extends Component{
    render(props){
        return (
            <div className="searchField">
               <input type ="text"
                    name = "searchField"
                    id="searchField"
                    onKeyDown = { event => {
                        if(event.key === 'Enter')
                        { this.props.onSearch()}
                        }}
                    placeholder = "Enter a Zip Code"
               />
               <button className ="searchButton"
                    onClick ={ () => this.props.onSearch()}>
                    Search
                </button>
            </div>
            )
        }
}

export default Sidebar