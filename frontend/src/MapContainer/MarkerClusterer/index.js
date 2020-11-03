import { useEffect } from "react";
import PropTypes from "prop-types";

import MarkerClusterer from "@googlemaps/markerclustererplus";

const evtNames = [
  "click",
  "dblclick",
  "dragend",
  "mousedown",
  "mouseout",
  "mouseover",
  "mouseup",
  "recenter",
];

function MarkerCluster(props) {
  const { map, google, markers } = props;

  // This hook works like ComponentWillMount
  // The  hook isn't really needed, this whole thing worked without it,
  // I added the hook so that I could implement a cleanup function
  useEffect(() => {
    const handleEvent = ({ event, marker, entry }) => {
      if (props[event]) {
        props[event]({
          props: props,
          marker: marker,
          event: event,
          entry: entry,
        });
      }
    };

    if (map && markers) {
      const mapMarkers = markers.map((marker) => {
        const entry = new google.maps.Marker({
          position: {
            lat: marker.position.lat,
            lng: marker.position.lng,
          },
          map: map,
          meta: marker.meta,
          name: marker.name,
          icon: {
            url: require(`./../../../src/assets/marker-${marker.color}.png`),
            scaledSize: new google.maps.Size(21, 21),
          },
        });

        evtNames.forEach((e) => {
          entry.addListener(e, () =>
            handleEvent({
              event: e,
              marker: marker,
              entry: entry,
            })
          );
        });

        return entry;
      });

      const clusterer = new MarkerClusterer(map, mapMarkers, {
        minimumClusterSize: props.minimumClusterSize,
        imagePath:
          "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
      });

      // Cleanup function. Note, this is only returned if we create the markers
      return () => {
        //console.log('Cleaning up markers')
        clusterer.clearMarkers();
      };
    }
  }, [map, google, markers, props.minimumClusterSize]);

  // Do we need to render anything??
  return null;
}

MarkerCluster.propTypes = {
  map: PropTypes.object,
  minimumClusterSize: PropTypes.number.isRequired,
  google: PropTypes.object,
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      position: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default MarkerCluster;
