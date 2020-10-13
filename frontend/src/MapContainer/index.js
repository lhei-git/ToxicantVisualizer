/* eslint-disable import/first */
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
    this.MarkerSet = this.MarkerSet.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(prevProps.filters) !== JSON.stringify(this.props.filters)
    ) {
      const oldPoints = this.state.points;
      this.setState({
        markers: this.MarkerSet(oldPoints),
      });
    }
  }

  onMarkerClick(props, marker) {
    this.props.setChemical(marker.meta.chemical);
    const showing = this.state.showingInfoWindow;
    if (!showing || this.state.activeMarker !== marker) {
      this.setState({
        activeMarker: marker,
        showingInfoWindow: true,
      });
      this.map.setCenter(marker.position);
      this.map.setZoom(14);
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
            isLoading: false,
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

  fetchPoints(map) {
    const ne = map.getBounds().getNorthEast();
    const sw = map.getBounds().getSouthWest();
    axios
      .get(
        `/facilities?ne_lat=${ne.lat()}&ne_lng=${ne.lng()}&sw_lat=${sw.lat()}&sw_lng=${sw.lng()}`
      )
      .then((res) => {
        this.setState({
          points: res.data.map((d) => d.fields),
          markers: this.MarkerSet(res.data.map((d) => d.fields)),
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
        mapsApi.event.addListenerOnce(map, "idle", () => this.fetchPoints(map));
      } catch (err) {
        console.log(err);
      }
    }
  }

  MarkerSet(points) {
    console.log("creating markers");
    // create a marker for every point that is passed to the map
    const markers = points
      .filter((p, i, arr) => {
        if (this.props.filters.carcinogens && p.carcinogen === "NO") {
          return false;
        } else if (this.props.filters.dioxins && !p.dioxin) {
          return false;
        } else if (
          this.props.filters.releaseType === "air" &&
          p.totalreleaseair === 0
        )
          return false;
        else if (
          this.props.filters.releaseType === "water" &&
          p.totalreleasewater === 0
        )
          return false;
        else if (
          this.props.filters.releaseType === "land" &&
          p.totalreleaseland === 0
        )
          return false;
        return i > 0 && p.facilityname !== arr[i - 1].facilityname;
      })
      .map((point, i) => {
        let color = 1;
        if (point.totalreleases < 100) color = 1;
        else if (point.totalreleases < 100) color = 2;
        else if (point.totalreleases < 10000) color = 3;
        else if (point.totalreleases < 100000) color = 4;
        else if (point.totalreleases < 1000000) color = 5;
        else color = 6;
        return (
          <Marker
            name={"point " + i}
            key={"point-" + i}
            position={{ lat: point.latitude, lng: point.longitude }}
            meta={point}
            icon={{
              url: require(`./../../src/assets/marker-${color}.png`),
              scaledSize: new this.props.google.maps.Size(20, 20),
            }}
            onClick={this.onMarkerClick}
          />
        );
      });
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
            {this.state.markers}
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
                    <p>Chemical: {this.state.activeMarker.meta.chemical}</p>
                    <p>
                      Industry: {this.state.activeMarker.meta.industrysector}
                    </p>
                    <p>
                      Amount:{" "}
                      {this.state.activeMarker.meta.totalreleases
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                      lbs
                    </p>{" "}
                    <p>Carcinogen: {this.state.activeMarker.meta.carcinogen}</p>
                  </div>
                )}
              </div>
            </InfoWindow>
          </Map>
        </div>
        )
      </div>
    );
  }
}

export default GoogleApiWrapper((props) => ({
  apiKey: props.apiKey,
}))(MapContainer);
