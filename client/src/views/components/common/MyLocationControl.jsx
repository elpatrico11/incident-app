import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

function MyLocationControl({ onLocate }) {
  const map = useMap();

  useEffect(() => {
    // Create a new Leaflet control in the top-left corner
    const locationControl = L.control({ position: 'topleft' });

    locationControl.onAdd = function (map) {
      // Create an element that will hold our custom button
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

      const button = L.DomUtil.create('a', 'leaflet-bar-part', container);
      button.href = '#';
      button.title = 'Zlokalizuj mnie'; // 


      button.innerHTML = '📍';

      // Prevent clicks on the button from propagating to the map
      L.DomEvent.disableClickPropagation(button);

      // Handle the click event
      L.DomEvent.on(button, 'click', (e) => {
        e.preventDefault();
        onLocate?.(); 
      });

      return container;
    };

    // Add the control to the map
    locationControl.addTo(map);

    // Clean up the control if component unmounts
    return () => {
      map.removeControl(locationControl);
    };
  }, [map, onLocate]);

  return null;
}

export default MyLocationControl;
