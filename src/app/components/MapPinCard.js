"use client";

import React from 'react';
import Image from 'next/image';
import { FaUser, FaMapMarkerAlt, FaHashtag, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function MapPinCard({ listing, onClick }) {
  if (!listing) {
    return null;
  }

  const title = listing.post_title || listing.title_of_post || 'No Title';
  const location = listing.city_project || listing.city_madinah || 'No Location';
  const equipmentCount = listing.Equip_Nuum || listing.equipNumm || 0;
  const imageUrl = listing.contractor_img?.[0] || listing.equip_photo?.[0] || null;
  const createdAt = listing.created_at?.toDate() || listing.created_att?.toDate() || new Date();
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: ar });

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-sm w-full cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 truncate">{title}</h2>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
          <FaClock className="mr-2" />
          <span>{timeAgo}</span>
        </div>
      </div>
      <div className="flex items-start space-x-4 p-4">
        <div className="flex-shrink-0 w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
          {imageUrl ? (
            <Image 
              src={imageUrl}
              alt={title}
              layout="fill"
              objectFit="cover"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FaUser size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <FaMapMarkerAlt className="inline-block mr-1" />
            <span>{location}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <FaHashtag className="inline-block mr-1" />
            <span>{`عدد المعدات المعروضة: ${equipmentCount}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}