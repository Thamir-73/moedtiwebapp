"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaHeart, FaMapMarkerAlt, FaUser, FaHashtag } from 'react-icons/fa';
import { getDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useRouter } from 'next/navigation'; // Make sure this import is correct

export default function PreviewCard({ listing, userType }) {
  const router = useRouter(); // Initialize useRouter
  const [userData, setUserData] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const isEquipUse = userType === 'yes';

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('Listing object:', listing);
      const userRef = isEquipUse ? listing.created_byy : listing.created_by;
      console.log('User Reference:', userRef);
  
      if (userRef) {
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Fetched user data:', userData);
            setUserData(userData);
          } else {
            console.log('User document does not exist');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('Invalid user reference');
      }
    };
    fetchUserData();
  }, [listing, isEquipUse]);

  if (!listing) {
    return null;
  }

  const title = listing.post_title || listing.title_of_post || 'No Title';
  const location = listing.city_project || listing.city_madinah || 'No Location';
  const equipmentCount = listing.Equip_Nuum || listing.equipNumm || 0;
  const imageUrl = listing.contractor_img?.[0] || listing.equip_photo?.[0] || null;
  const createdAt = listing.created_at?.toDate() || listing.created_att?.toDate() || new Date();
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: ar });

  const handleCardClick = () => {
    const adId = listing.id;
    router.push(`/ads/${adId}`);
  };

  return (
    <div 
      className="bg-transparent p-3 shadow-xl border border-gray-300 rounded-lg relative w-full cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Mobile layout */}
      <div className="sm:hidden">
        <div className="flex justify-between items-start mb-1">
          <span className="text-md text-gray-500 dark:text-gray-400">{timeAgo}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="text-2xl text-gray-400 hover:text-red-500"
          >
            <FaHeart className={isFavorite ? 'text-red-500' : ''} />
          </button>
        </div>
        <h2 className="text-lg font-bold truncate text-gray-800 dark:text-white mb-4">{title}</h2>
      </div>
  
      {/* Desktop layout */}
      <div className="hidden sm:block">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-bold truncate text-gray-800 dark:text-white">{title}</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 m-2">{timeAgo}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="text-2xl text-gray-400 hover:text-red-500"
            >
              <FaHeart className={isFavorite ? 'text-red-500' : ''} />
            </button>
          </div>
        </div>
      </div>
  
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-shrink-0 w-full sm:w-20 h-40 sm:h-20 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden relative">
          {imageUrl ? (
            <Image 
              src={imageUrl}
              alt={title}
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <FaUser size={24} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">
            <FaUser className="inline-block mr-1" />
            <span>{userData?.display_name || 'Unknown User'}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">
            <FaMapMarkerAlt className="inline-block mr-1" />
            <span>{location}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
            <FaHashtag className="inline-block mr-1" />
            <span>{`عدد المعدات المعروضة: ${equipmentCount}`}</span>
          </div>
        </div>
      </div>
    </div>
  
  );
}