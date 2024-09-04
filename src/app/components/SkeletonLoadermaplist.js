import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 animate-pulse">
    <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-md mb-4"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
  </div>
);

export const MapSkeleton = () => (
  <div className="w-full h-[400px] bg-gray-300 dark:bg-gray-600 rounded-lg relative overflow-hidden">
    {[...Array(5)].map((_, index) => (
      <div 
        key={index}
        className="absolute w-4 h-4 bg-red-500 rounded-full animate-ping"
        style={{
          top: `${Math.random() * 80 + 10}%`,
          left: `${Math.random() * 80 + 10}%`,
          animationDelay: `${Math.random() * 2}s`,
        }}
      ></div>
    ))}
  </div>
);