import "./index.css";
import PlacesAutocomplete from "react-places-autocomplete";
const geocoder = require("../api/geocoder");
const React = require("react");

function Home(props) {
  let [location, setLocation] = React.useState("");
  let [errorMessage, setErrorMessage] = React.useState("");

  async function geocodeLocation(location) {
    try {
      const res = await geocoder.get(`/json?address=${location}`);
      //get the state name, which google labels as administrative_area_level_1
      const results = res.data.results[0];
      const found = results.address_components.find((c) => {
        return c.types.includes("administrative_area_level_1");
      });
      const map = {
        address: results.formatted_address,
        center: results.geometry.location,
        viewport: results.geometry.viewport,
        stateShort: found.short_name,
        stateLong: found.long_name,
      };
      return map;
    } catch (err) {
      throw new Error("no results");
    }
  }

  function handleChange(location) {
    if (errorMessage.length > 0) setErrorMessage("");
    setLocation(location);
  }

  function handleSelect(location) {
    geocodeLocation(location)
      .then((map) => props.onSuccess(map))
      .catch((error) => console.error("Error", error));
  }

  function handleCloseClick() {
    setLocation("");
  }

  function handleError(status, clearSuggestions) {
    console.log("Error from Google Maps API", status); // eslint-disable-line no-console
    if (status === "ZERO_RESULTS") setErrorMessage("No results found");
    clearSuggestions();
  }
  const Footer = () => {
    const React = require("react");
    return (
      <div className="footer">
        &#169;{" "}
        <span>
          VET was developed in 2020 for the Lab for Health and Environmental
          Information
        </span>
      </div>
    );
  };

  return (
    <div className="home-container">
      <div className="background">
        <div className="overlay"></div>
      </div>
      <div className="content-group">
        <div className="header">Visualizer of Environmental Toxicants</div>
        <div className="caption">
          This VET tool was developed to obtain information from the Toxic
          Releases Inventory data of the U.S. EPA, and associated chemical
          information from the PubChem database, to map, organize and visualize
          information about releases of chemicals into water, air and land by
          manufacturing facilities across the U.S. This tool is for exploratory
          purposes only, focused on potential health issues with toxic releases.
          Any decision related to information herein should be made with other
          relevant information and analyses.
        </div>
        <div className="search-bar">
          <PlacesAutocomplete
            onChange={handleChange}
            value={location}
            onSelect={handleSelect}
            onError={handleError}
            shouldFetchSuggestions={location.length > 2}
            searchOptions={{
              componentRestrictions: {
                country: "us",
              },
            }}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps }) => {
              return (
                <div className="search-bar-container">
                  <div className="search-input-container">
                    <input
                      {...getInputProps({
                        placeholder: "Search Places...",
                        className: "search-input",
                      })}
                    />
                    {location.length > 0 && (
                      <button
                        className="clear-button"
                        onClick={handleCloseClick}
                      >
                        x
                      </button>
                    )}
                  </div>
                  {suggestions.length > 0 && (
                    <div className="autocomplete-container">
                      {suggestions.map((suggestion, i) => {
                        const className = `suggestion-item ${
                          suggestion.active ? "active" : ""
                        }`;

                        return (
                          <div
                            key={"suggestion-" + i}
                            {...getSuggestionItemProps(suggestion, {
                              className,
                            })}
                          >
                            <strong>
                              {suggestion.formattedSuggestion.mainText}
                            </strong>{" "}
                            <small>
                              {suggestion.formattedSuggestion.secondaryText}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }}
          </PlacesAutocomplete>
          {errorMessage.length > 0 && (
            <div className="error-message">{errorMessage}</div>
          )}
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default Home;
