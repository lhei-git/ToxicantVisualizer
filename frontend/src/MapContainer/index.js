import "./index.css";
import mapStyles from "./standard";
// import Icon1 from "./../../src/assets/marker-1.png";
// import Icon2 from "./../../src/assets/marker-2.png";
// import Icon3 from "./../../src/assets/marker-3.png";
// import Icon4 from "./../../src/assets/marker-4.png";
// import Icon5 from "./../../src/assets/marker-5.png";
// const Icon6 = require("./../../src/assets/marker-6.png");
const React = require("react");
const geocoder = require("../api/geocoder/index");
const axios = require("../api/axios/index");
const flatten = require("./flatten");
const Component = React.Component;
const {
  Map,
  Marker,
  InfoWindow,
  GoogleApiWrapper,
} = require("google-maps-react");

const INITIAL_CENTER = {
  lat: 39.8283,
  lng: -98.5795,
};

const containerStyle = {
  position: "relative",
  overflow: "hidden",
  height: "100%",
  width: "100%",
};

function shallowEqual(obj1, obj2) {
  // console.log(obj1, obj2);
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

// Wrapping class around Google Maps react object
class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeMarker: null,
      markers: [],
      points: [],
      showingInfoWindow: false,
      center: INITIAL_CENTER,
      isLoading: true,
      viewport: null,
      map: null,
    };

    this.fetchPoints = this.fetchPoints.bind(this);
    this.handleMount = this.handleMount.bind(this);
    this.adjustMap = this.adjustMap.bind(this);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.createMarkers = this.createMarkers.bind(this);
  }

  componentDidUpdate(prevProps) {
    const newState = {};
    const refeshed = prevProps.refreshed !== this.props.refreshed;
    const refiltered = !shallowEqual(prevProps.filters, this.props.filters);
    if (refeshed || refiltered) {
      if (refiltered) {
        const oldPoints = this.state.points;
        newState.markers = this.createMarkers(oldPoints);
      }

      const mapsApi = this.props.google.maps;
      const viewport = this.state.viewport;
      if (viewport) {
        try {
          const n = new mapsApi.LatLng(
            viewport.northeast.lat,
            viewport.northeast.lng
          );
          const s = new mapsApi.LatLng(
            viewport.southwest.lat,
            viewport.southwest.lng
          );
          const b = new mapsApi.LatLngBounds(s, n);
          this.map.fitBounds(b);
        } catch (err) {
          console.log(err);
        }
      }
      newState.showingInfoWindow = false;
      this.setState(newState);
    }
  }

  onMarkerClick(props, marker) {
    const showing = this.state.showingInfoWindow;
    if (!showing || this.state.activeMarker !== marker) {
      this.setState({
        activeMarker: marker,
        showingInfoWindow: true,
      });
      this.map.setCenter(marker.position);
      this.map.setZoom(14);
      this.props.onMarkerClick(marker.meta.chemicals);
    } else {
      this.setState({
        showingInfoWindow: false,
      });
    }
  }

  geocodeLocation(location) {
    return new Promise((resolve, reject) => {
      geocoder
        .get(`/json?address=${location}`)
        .then((res) => {
          this.setState({
            center: res.data.results[0].geometry.location,
            viewport: res.data.results[0].geometry.viewport,
          });
          localStorage.setItem(
            "viewport",
            JSON.stringify(res.data.results[0].geometry.viewport)
          );
        })
        .then(resolve)
        .catch(reject);
    });
  }

  fetchPoints(ne, sw) {
    console.log("fetching...");
    axios
      .get(
        `/facilities?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`
      )
      .then((res) => {
        console.log("flattening...");
        const points = flatten(res.data.map((d) => d.fields));
        this.setState({
          points,
          markers: this.createMarkers(points),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  chemicalToTitle(chem) {
    return chem.charAt(0) + chem.slice(1).toLowerCase();
  }

  getCenter() {
    let state = this.state;
    if (state.activeMarker) {
      return {
        lat: this.state.activeMarker.position.lat(),
        lng: this.state.activeMarker.position.lng(),
      };
    } else {
      return this.props.searchedCenter || INITIAL_CENTER;
    }
  }

  handleMount(mapProps, map) {
    this.map = map;
    const location = localStorage.getItem("searchedLocation") || "";
    if (location !== "")
      this.geocodeLocation(location).then(() => {
        this.adjustMap(mapProps, map);
      });
  }

  adjustMap(mapProps, map) {
    const mapsApi = this.props.google.maps;
    const viewport = this.state.viewport;
    if (viewport) {
      try {
        const n = new mapsApi.LatLng(
          viewport.northeast.lat,
          viewport.northeast.lng
        );
        const s = new mapsApi.LatLng(
          viewport.southwest.lat,
          viewport.southwest.lng
        );
        const b = new mapsApi.LatLngBounds(s, n);
        map.fitBounds(b);
        // const ne = map.getBounds().getNorthEast();
        // const sw = map.getBounds().getSouthWest();
        mapsApi.event.addListenerOnce(map, "idle", () =>
          this.fetchPoints(viewport.northeast, viewport.southwest)
        );
      } catch (err) {
        console.log(err);
      }
    }
  }

  filterChemicalList(list, filters) {
    const newList = [];
    list.forEach((chemical) => {
      if (
        (filters.carcinogens && chemical.carcinogen === "NO") ||
        (filters.releaseType === "air" && chemical.totalreleaseair === 0) ||
        (filters.releaseType === "water" && chemical.totalreleasewater === 0) ||
        (filters.releaseType === "land" && chemical.totalreleaseland === 0)
      ) {
      } else newList.push(chemical);
    });
    return newList;
  }

  filterFacilities(facilities) {
    return facilities
      .map((f, i) => {
        const totalFacilityReleases = this.filterChemicalList(
          f.chemicals,
          this.props.filters
        ).reduce((acc, cur) => acc + cur.totalreleases, 0);
        if (totalFacilityReleases === 0) return null;
        let color = 1;

        if (totalFacilityReleases < 100) color = 1;
        else if (totalFacilityReleases < 100) color = 2;
        else if (totalFacilityReleases < 10000) color = 3;
        else if (totalFacilityReleases < 100000) color = 4;
        else if (totalFacilityReleases < 1000000) color = 5;
        else color = 6;

        f.color = color;
        return f;
      })
      .filter((f) => f !== null);
  }

  createMarkers(points) {
    console.log("creating markers");
    const facilities = this.filterFacilities(points);
    // create a marker for every point that is passed to the map
    console.log(this.map.getZoom());
    // const dimension = this.map.getZoom() <= 7 ? 15 : 20;
    const markers = facilities.map((facility, i) => {
      return (
        <Marker
          name={"point " + i}
          key={"point-" + i}
          position={{ lat: facility.latitude, lng: facility.longitude }}
          meta={facility}
          icon={{
            url: require(`./../../src/assets/marker-${facility.color}.png`),
            scaledSize: new this.props.google.maps.Size(18, 18),
          }}
          onClick={this.onMarkerClick}
        />
      );
    });
    this.setState({ isLoading: false });
    this.props.onUpdate(markers.length);
    return markers;
  }

  render() {
    return (
      <div className="map-container">
        <div className="map">
          <Map
            onReady={this.handleMount}
            google={this.props.google}
            streetViewControl={false}
            styles={mapStyles}
            draggable={false}
            zoom={5}
            center={this.state.center}
            initialCenter={INITIAL_CENTER}
            containerStyle={containerStyle}
          >
            {!this.state.isLoading && this.state.markers}
            <InfoWindow
              marker={this.state.activeMarker}
              visible={this.state.showingInfoWindow}
            >
              <div className="info-window">
                {this.state.activeMarker !== null && (
                  <div>
                    <h2>{this.state.activeMarker.meta.facilityname}</h2>
                    <p>
                      {this.state.activeMarker.meta.streetaddress} <br></br>
                      {this.state.activeMarker.meta.city},{" "}
                      {this.state.activeMarker.meta.st}{" "}
                      {this.state.activeMarker.meta.zip}
                    </p>
                    <p>
                      Industry: {this.state.activeMarker.meta.industrysector}
                    </p>
                    <p>
                      Total Amount Released:{" "}
                      {
                        +this.state.activeMarker.meta.chemicals
                          .reduce((acc, cur) => acc + cur.totalreleases, 0)
                          .toFixed(2)
                      }{" "}
                      lbs
                    </p>
                  </div>
                )}
              </div>
            </InfoWindow>
          </Map>
          )
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper((props) => ({
  apiKey: props.apiKey,
}))(MapContainer);
