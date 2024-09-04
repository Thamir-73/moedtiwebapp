"use client";

import PreviewCard from './PreviewCard';

export default function ListView({ listings, userType, isSearching }) {
  if (!listings || listings.length === 0) {
    return <div className="text-center py-4 text-gray-700 dark:text-gray-300">No listings available</div>;
  }

  return (
    <div className="w-full space-y-4">
      {listings.map(listing => (
        <div
          key={listing.id}
          className={`transition-all border duration-300 ${
            isSearching ? 'border-blue-300' : 'border-transparent' 
          }`}
        >
          <PreviewCard listing={listing} userType={userType} />
        </div>
      ))}
    </div>
  );
}