import "./index.css";
import mapStyles from "./standard";
const React = require("react");
const geocoder = require("../api/geocoder/index");
const vetapi = require("../api/vetapi/index");
const flatten = require("./flatten");
const { shallowEqual } = require("../helpers");
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
      hasMoved: false,
    };

    this.fetchPoints = this.fetchPoints.bind(this);
    this.handleMount = this.handleMount.bind(this);
    this.adjustMap = this.adjustMap.bind(this);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.createMarkers = this.createMarkers.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  onRefresh() {
    const newState = {};
    const oldPoints = this.state.points;
    newState.markers = this.createMarkers(oldPoints);

    const mapsApi = this.props.google.maps;
    const viewport = this.state.viewport;
    if (viewport) {
      try {
        const b = this.createLatLngBounds(viewport, mapsApi);
        this.map.fitBounds(b);
      } catch (err) {
        console.log(err);
      }
    }
    newState.showingInfoWindow = false;
    newState.hasMoved = false;
    this.setState(newState, () => {
      this.props.onRefresh();
    });
  }

  componentDidUpdate(prevProps) {
    const newState = {};
    const refiltered = !shallowEqual(prevProps.filters, this.props.filters);
    if (refiltered) {
      if (this.props.filters.year !== prevProps.filters.year) {
        this.fetchPoints(
          this.state.viewport.northeast,
          this.state.viewport.southwest
        );
      } else {
        const oldPoints = this.state.points;
        newState.markers = this.createMarkers(oldPoints);
      }

      const mapsApi = this.props.google.maps;
      const viewport = this.state.viewport;
      if (viewport) {
        try {
          const b = this.createLatLngBounds(viewport, mapsApi);
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
        hasMoved: true,
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
    const params = {
      ne_lat: ne.lat,
      ne_lng: ne.lng,
      sw_lat: sw.lat,
      sw_lng: sw.lng,
      year: this.props.filters.year,
    };
    vetapi
      .get(`/facilities`, { params })
      .then((res) => {
        console.log("flattening...");
        const data = res.data.map((d) => d.fields);
        const points = flatten(data);
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
    const mapsApi = this.props.google.maps;
    setTimeout(() => {
      mapsApi.event.addListener(map, "center_changed", () => {
        this.setState({ hasMoved: true });
      });
    }, 1000);

    const location = localStorage.getItem("searchedLocation") || "";
    // const viewport = localStorage.getItem("viewport");
    if (location !== "")
      this.geocodeLocation(location).then(() => {
        this.adjustMap(mapProps, map);
      });
    // else {
    //   this.setState({ viewport: JSON.parse(viewport) }, () => {
    //     this.adjustMap(mapProps, map);
    //   });
    // }
  }

  adjustMap(mapProps, map) {
    const mapsApi = this.props.google.maps;
    const viewport = this.state.viewport;
    if (viewport) {
      try {
        const b = this.createLatLngBounds(viewport, mapsApi);
        map.fitBounds(b);
        mapsApi.event.addListenerOnce(map, "idle", () =>
          this.fetchPoints(viewport.northeast, viewport.southwest)
        );
      } catch (err) {
        console.log(err);
      }
    }
  }

  createLatLngBounds(viewport, api) {
    const n = new api.LatLng(viewport.northeast.lat, viewport.northeast.lng);
    const s = new api.LatLng(viewport.southwest.lat, viewport.southwest.lng);
    return new api.LatLngBounds(s, n);
  }

  filterChemicalList(list, filters) {
    const newList = [];
    list.forEach((chemical) => {
      if (
        (filters.carcinogens && chemical.carcinogen === "NO") ||
        (filters.releaseType === "air" && chemical.totalreleaseair === 0) ||
        (filters.releaseType === "water" && chemical.totalreleasewater === 0) ||
        (filters.releaseType === "land" && chemical.totalreleaseland === 0) ||
        (filters.releaseType === "on-site" &&
          chemical.on_sitereleasetotal === 0) ||
        (filters.releaseType === "off-site" &&
          chemical.off_sitereleasetotal === 0)
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
    const markers = facilities.map((facility, i) => {
      return (
        <Marker
          name={"point " + i}
          key={"point-" + i}
          position={{ lat: facility.latitude, lng: facility.longitude }}
          meta={facility}
          icon={{
            url: require(`./../../src/assets/marker-${facility.color}.png`),
            scaledSize: new this.props.google.maps.Size(21, 21),
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
        {this.state.hasMoved && (
          <div className="refresh" onClick={this.onRefresh}>
            RESET
          </div>
        )}
        <div className="map">
          <Map
            onReady={this.handleMount}
            google={this.props.google}
            streetViewControl={false}
            styles={mapStyles}
            draggable={true}
            fullscreenControl={false}
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
                      Total Toxicants Released:{" "}
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
