import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchFilters({ onFilterChange, onSearchChange, filterValues }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearchChange(searchTerm);
      setIsSearching(searchTerm.length > 0);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearchChange]);

  const { cities, districts } = filterValues;

  const handleCityChange = (city) => {
    setSelectedCity(city);
    onFilterChange({ city, district: selectedDistrict });
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    onFilterChange({ city: selectedCity, district });
  };

  return (
    <div className="w-full max-w-5xl mb-4 space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="ابحث..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-ocean-blue rounded-full dark:bg-gray-800 dark:text-gray-300 dark:border-ocean-blue focus:border-ocean-blue dark:focus:border-ocean-blue focus:outline-none focus:ring"
        />
        <FaSearch 
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${isSearching ? 'animate-pulse' : ''}`}
          style={{
            color: isSearching ? '#3b82f6' : '#9ca3af'
          }}
        />
      </div>
      <div className="flex space-x-2 rtl:space-x-reverse">
        <div className="relative w-full sm:w-1/2">
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full px-4 py-2 border border-ocean-blue rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-ocean-blue focus:border-ocean-blue dark:focus:border-ocean-blue focus:outline-none focus:ring"
          >
            <option value="">اختر المدينة</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="relative w-full sm:w-1/2">
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full px-4 py-2 border border-ocean-blue rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-ocean-blue focus:border-ocean-blue dark:focus:border-ocean-blue focus:outline-none focus:ring"
          >
            <option value="">اختر الحي</option>
            {districts.map((district, index) => (
              <option key={index} value={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}