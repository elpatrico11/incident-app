
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import '../../../App.css';

const MarkerClusterGroup = ({ incidents }) => {
  const map = useMap();

  useEffect(() => {
    // Define the iconCreateFunction to customize cluster icons
    const iconCreateFunction = (cluster) => {
      const count = cluster.getChildCount();

      // Determine the size or type based on the number of markers
      let size = 'small';
      if (count >= 10 && count < 100) {
        size = 'medium';
      } else if (count >= 100) {
        size = 'large';
      }

      return L.divIcon({
        html: `<div><span>${count}</span></div>`,
        className: `custom-cluster custom-cluster-${size}`,
        iconSize: L.point(40, 40, true),
      });
    };

    // Initialize the marker cluster group with the custom iconCreateFunction
    const markerCluster = L.markerClusterGroup({
      iconCreateFunction,
    });

    // Create markers and add them to the cluster group
    incidents.forEach((incident) => {
      if (incident.location && incident.location.coordinates) {
        const marker = L.marker([
          incident.location.coordinates[1],
          incident.location.coordinates[0],
        ]);

        // Bind popup to marker
        marker.bindPopup(`
          <strong>${incident.category}</strong><br/>
          ${incident.description}<br/>
          <em>Status: ${incident.status}</em>
        `);

        markerCluster.addLayer(marker);
      }
    });

    // Add the cluster group to the map
    map.addLayer(markerCluster);

    // Cleanup function to remove the cluster group on unmount or when incidents change
    return () => {
      map.removeLayer(markerCluster);
    };
  }, [map, incidents]);

  return null; 
};

export default MarkerClusterGroup;
