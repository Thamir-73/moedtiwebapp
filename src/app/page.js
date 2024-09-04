'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';
import Map from './components/Map';
import ListView from './components/Listview';
import SearchFilters from './components/SearchFilters';
import { getUserType, setUserType } from './utils/userType';
import { fetchEquipUseListings, fetchContractorUseListings, fetchUniqueFilterValues } from './utils/firebase';
import { useDarkMode } from './contexts/DarkModeContext';
import Image from 'next/image';
import { useAuth } from './contexts/AuthContext';
import SignIn from './components/SignIn';
import UserTypeModal from './components/UserTypeModal';
import { CardSkeleton, MapSkeleton } from './components/SkeletonLoadermaplist';
import Link from 'next/link';

export default function Home() {
  const [userType, setUserTypeState] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const [listings, setListings] = useState([]);
  const [visibleListings, setVisibleListings] = useState([]);
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState({ city: '', district: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [filterValues, setFilterValues] = useState({ cities: [], districts: [] });
  const { darkMode } = useDarkMode();
  const mapSectionRef = useRef(null);
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const INITIAL_LOAD_COUNT = 20;
  const LOAD_MORE_COUNT = 20;

  const sortListingsByTimestamp = (listings) => {
    return listings.sort((a, b) => {
      const timestampA = a.created_att || a.created_at || 0;
      const timestampB = b.created_att || b.created_at || 0;
      return timestampB - timestampA;
    });
  };

  useEffect(() => {
    const determineUserType = () => {
      if (user) {
        setUserTypeState(user.iseqqquip === 'yes' ? 'yes' : 'no');
        setUserType(user.iseqqquip === 'yes' ? 'yes' : 'no');
      } else {
        const storedUserType = getUserType();
        if (storedUserType) {
          setUserTypeState(storedUserType);
        }
      }
    };

    determineUserType();
  }, [user]);

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setUserTypeState(type);
    setShowUserTypeModal(false);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyR') {
        localStorage.removeItem('userType');
        setUserTypeState(null);
        console.log('User type reset');
      }
    };
  
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const fetchListingsData = async () => {
      if (userType) {
        try {
          setIsLoading(true);
          setIsLoadingMore(true);
          const fetchListings = userType === 'yes' ? fetchContractorUseListings : fetchEquipUseListings;
          const fetchedListings = await fetchListings();
          console.log('Fetched listings:', fetchedListings.map(l => ({ id: l.id, timestamp: l.created_att || l.created_at })));
          const sortedListings = sortListingsByTimestamp(fetchedListings);
          console.log('Sorted listings:', sortedListings.map(l => ({ id: l.id, timestamp: l.created_att || l.created_at })));
          setListings(sortedListings);
          setVisibleListings(sortedListings.slice(0, INITIAL_LOAD_COUNT));
          setIsLoadingMore(false);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching listings:', error);
          setIsLoadingMore(false);
          setIsLoading(false);
        }
      }
    };
    fetchListingsData();
  }, [userType]);


  useEffect(() => {
    const fetchFilterValues = async () => {
      if (userType) {
        try {
          const collectionName = userType === 'yes' ? 'contractor_use' : 'equip_use';
          const values = await fetchUniqueFilterValues(collectionName);
          setFilterValues(values);
        } catch (error) {
          console.error('Error fetching filter values:', error);
        }
      }
    };
    fetchFilterValues();
  }, [userType]);

  useEffect(() => {
    if (!userType && !user) {
      const handleScroll = () => {
        if (mapSectionRef.current) {
          const rect = mapSectionRef.current.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= 0) {
            setShowUserTypeModal(true);
            window.removeEventListener('scroll', handleScroll);
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [userType, user]);

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setIsSearching(term.length > 0);
  }, []);

  const filteredListings = useMemo(() => {
    const filtered = listings.filter(listing => 
      (listing.title_of_post?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       listing.post_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       listing.city_madinah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       listing.city_project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       listing.district_hai?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       listing.district_project?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!activeFilter.city || 
       listing.city_madinah?.toLowerCase() === activeFilter.city.toLowerCase() || 
       listing.city_project?.toLowerCase() === activeFilter.city.toLowerCase()) &&
      (!activeFilter.district || 
       listing.district_hai?.toLowerCase() === activeFilter.district.toLowerCase() || 
       listing.district_project?.toLowerCase() === activeFilter.district.toLowerCase())
    );
    return sortListingsByTimestamp(filtered);
  }, [listings, searchTerm, activeFilter]);

  useEffect(() => {
    setVisibleListings(filteredListings.slice(0, INITIAL_LOAD_COUNT));
    setLoadMoreCount(0);
  }, [filteredListings]);

  useEffect(() => {
    if (filteredListings.length > 0 && viewMode === 'map') {
      const firstListing = filteredListings[0];
      if (mapSectionRef.current && firstListing.location) {
        mapSectionRef.current.panTo(firstListing.location);
      }
    }
  }, [filteredListings, viewMode]);

  const loadMoreListings = () => {
    const currentLength = visibleListings.length;
    const newListings = filteredListings.slice(currentLength, currentLength + LOAD_MORE_COUNT);
    setVisibleListings(prevListings => [...prevListings, ...newListings]);
    setLoadMoreCount(prevCount => prevCount + 1);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (loadMoreCount >= 2 && 
          window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 &&
          !isLoadingMore) {
        loadMoreListings();
      }
    };

    if (loadMoreCount >= 2) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreCount, isLoadingMore]);

  const getButtonText = () => {
    if (userType === 'yes' || (user && user.iseqqquip === 'yes')) {
      return 'انشر معداتك';
    } else {
      return 'انشر مشروعك لاصحاب المعدات';
    }
  };

  const handleOpenSignIn = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('previousPath', window.location.pathname);
    }
    setShowSignIn(true);
  };

  const handleCreateAdClick = () => {
    if (!user) {
      handleOpenSignIn();
    } else {
      window.location.href = '/create-ad/page1';
    }
  };

  const handleSignInSuccess = () => {
    setShowSignIn(false);
    const previousPath = sessionStorage.getItem('previousPath') || '/create-ad/page1';
    window.location.href = previousPath;
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      <main className="flex min-h-screen flex-col items-center p-4 rtl" style={{ direction: 'rtl' }}>
        <div className="w-full max-w-6xl mb-10 py-4 sm:py-2">
          <div className="bg-gray dark:bg-gray-800 border border-orange-300 rounded-lg shadow-lg p-6 md:p-8 lg:p-10">
            <div className="flex flex-col items-center animate-fadeIn">
              <div className="w-full mb-0 flex flex-col items-center text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-700 dark:text-gray-200 
                               bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent
                               drop-shadow-md hover:drop-shadow-lg transition-all duration-300
                               animate-float leading-tight">
                  إعادة تعريف صفقات إيجار المعدات الثقيلة
                </h1>
                <h3 className="text-lg sm:text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-1">
                  مستقبل أعمالك الإنشائية الناجحة يبدأ هنا
                </h3>
              </div>
              <div className="w-full sm:w-3/4 md:w-1/2 lg:w-2/5">
                <Image
                  src="/hero-image.png"
                  alt="Heavy Equipment Illustration"
                  width={500}
                  height={500}
                  layout="responsive"
                  className="rounded-xl"
                />
              </div>
              <div className="flex space-x-4 mt-6">
                <div className="pl-4">
                  {!user && (
                    <button 
                      onClick={handleOpenSignIn}
                      className="px-6 py-2 lg:px-20 bg-gray border border-orange-300 text-gray-700 dark:text-gray-200 rounded-lg hover:shadow-xl transition-colors"
                    >
                      تسجيل دخول
                    </button>
                  )}
                </div>
                <Link 
      href="/about"
      className="inline-block"
    >
      <button 
        className="px-6 py-2 lg:px-20 bg-orange-300 text-gray-700 rounded-lg hover:shadow-xl transition-colors">
        عن معدتي
      </button>
    </Link>
              </div>
            </div>
          </div>
        </div>

        <hr className="w-full max-w-6xl border-t border-gray-300 dark:border-gray-700 mb-4" />

        <SearchFilters
          onFilterChange={handleFilterChange} 
          onSearchChange={handleSearchChange}
          filterValues={filterValues}
        />
        {isSearching && (
          <p className="w-full max-w-6xl text-sm text-gray-600 dark:text-gray-400 mb-2">
            {filteredListings.length === 0 ? 'لا توجد نتائج' : `تم العثور على ${filteredListings.length} نتيجة`}
          </p>
        )}
        {(userType || (user && user.iseqqquip)) && (
          <h2 className="text-2xl font-bold border border-gray-300 px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200">
            {(userType === 'yes' || (user && user.iseqqquip === 'yes')) ? 'مشاريع المقاولين' : 'اصحاب المعدات'}
          </h2>
        )}
        <div ref={mapSectionRef} className="w-full max-w-full sm:max-w-6xl mt-4 bg-gray dark:bg-gray-800 border border-orange-300 rounded-lg py-3 px-2 md:p-4 lg:p-4 shadow-lg relative">
          <div className='flex justify-between items-center w-full max-w-6xl mb-4'>
            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {viewMode === 'map' ? 'عرض القائمة' : 'عرض الخريطة'}
            </button>
            {userType && (
              <button
                onClick={handleCreateAdClick}
                className="flex items-center px-2 py-2 bg-gray text-gray-700 rounded-lg border border-orange-400 hover:shadow-lg transition-colors"
              >
                <FaPlus className="ml-1" />
                {getButtonText()}
              </button>
            )}
          </div>
          {isLoading ? (
            viewMode === 'map' ? (
              <MapSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </div>
            )
          ) : (
            viewMode === 'map' ? (
              <Map listings={filteredListings} userType={userType} onUserTypeSelect={handleUserTypeSelection} />
            ) : (
              <>
                <ListView listings={visibleListings} userType={userType} isSearching={isSearching} />
                {visibleListings.length < filteredListings.length && (
                  <div className="w-full text-center mt-4">
                    <button
                      onClick={loadMoreListings}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
                    </button>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </main>
      {showSignIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <SignIn onClose={() => setShowSignIn(false)} onSignInSuccess={handleSignInSuccess} />
        </div>
      )}
      {showUserTypeModal && !user && (
        <div className="fixed inset-0 bg-gray bg-opacity-50 flex items-center justify-center z-50">
          <UserTypeModal onSelect={handleUserTypeSelection} />
        </div>
      )}
    </div>
  );
}