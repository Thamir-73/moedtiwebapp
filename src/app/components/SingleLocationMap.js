import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px', // Adjust as needed
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

const buildingIcon = {
  path: "M15,11V5l-3-3L9,5v2H3v14h18V11H15z M7,19H5v-2h2V19z M7,15H5v-2h2V15z M7,11H5V9h2V11z M13,19h-2v-2h2V19z M13,15h-2v-2h2    V15z M13,11h-2V9h2V11z M13,7h-2V5h2V7z M19,19h-2v-2h2V19z M19,15h-2v-2h2V15z",
  fillColor: "#4169E1",
  fillOpacity: 1,
  strokeWeight: 1,
  strokeColor: "#000080",
  rotation: 0,
  scale: 1,
};

export default function SingleLocationMap({ location }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={location}
      zoom={14}
      options={mapOptions}
    >
      <Marker
        position={location}
        icon={buildingIcon}
      />
    </GoogleMap>
  );
}