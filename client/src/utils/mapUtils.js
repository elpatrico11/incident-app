import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Call this once at the app's initialization or in relevant components
export function setupLeafletMarkerIcons() {
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
}
