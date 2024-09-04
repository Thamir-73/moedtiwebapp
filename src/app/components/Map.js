import { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import Image from 'next/image';
import { FaUser, FaMapMarkerAlt, FaHashtag, FaClock, FaTimes } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const mapContainerStyle = {
  width: '100%',
  height: '70vh',
  maxHeight: '600px',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
};

const center = {
  lat: 24.7136,
  lng: 46.6753
};

const bulldozerIcon = {
  path: "M21.5,9.5h-1v-2h1c0.6,0,1-0.4,1-1s-0.4-1-1-1h-19c-0.6,0-1,0.4-1,1s0.4,1,1,1h1v2h-1c-0.6,0-1,0.4-1,1s0.4,1,1,1h1v2h-1 c-0.6,0-1,0.4-1,1s0.4,1,1,1h19c0.6,0,1-0.4,1-1s-0.4-1-1-1h-1v-2h1c0.6,0,1-0.4,1-1S22.1,9.5,21.5,9.5z M18.5,13.5h-13v-2h13V13.5z M18.5,9.5h-13v-2h13V9.5z",
  fillColor: "#FFA500",
  fillOpacity: 1,
  strokeWeight: 1,
  strokeColor: "#FF8C00",
  rotation: 0,
  scale: 1.5,
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

export default function Map({ listings, userType, onUserTypeSelect }) {
  const [selectedListing, setSelectedListing] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  });

  if (loadError) {
    console.error('Error loading Google Maps:', loadError);
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) return <div>جاري تحميل الخريطة...</div>;

  const handleUserTypeSelection = (type) => {
    onUserTypeSelect(type);
  };

  const renderSelectedListingCard = () => {
    if (!selectedListing) return null;

    const title = selectedListing.post_title || selectedListing.title_of_post || 'No Title';
    const location = selectedListing.city_project || selectedListing.city_madinah || 'No Location';
    const equipmentCount = selectedListing.Equip_Nuum || selectedListing.equipNumm || 0;
    const imageUrl = selectedListing.contractor_img?.[0] || selectedListing.equip_photo?.[0] || null;
    const createdAt = selectedListing.created_at?.toDate() || selectedListing.created_att?.toDate() || new Date();
    const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: ar });

    return (
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md w-full m-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">{title}</h2>
            <button 
              onClick={() => setSelectedListing(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes size={24} />
            </button>
          </div>
          <div className="relative h-48 w-full mb-4">
            {imageUrl ? (
              <Image 
                src={imageUrl}
                alt={title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700 rounded-lg">
                <FaUser size={48} className="text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FaClock className="mr-2" />
              <span>{timeAgo}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FaMapMarkerAlt className="mr-2" />
              <span>{location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FaHashtag className="mr-2" />
              <span>{`عدد المعدات المعروضة: ${equipmentCount}`}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={mapRef}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={10}
        options={mapOptions}
      >
        {listings.map((listing) => {
          const location = userType === 'yes' ? listing.Project_loca : listing.equipmentloca;
          if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
            return (
              <Marker
                key={listing.id}
                position={{
                  lat: location.latitude,
                  lng: location.longitude
                }}
                icon={userType === 'yes' ? buildingIcon : bulldozerIcon}
                onClick={() => setSelectedListing(listing)}
              />
            );
          }
          return null;
        })}
      </GoogleMap>
      {renderSelectedListingCard()}
    </div>
  );
}