"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth } from '../../utils/firebase';
import { FaMapMarkerAlt, FaPhone, FaImage, FaSearch, FaMousePointer, FaCity, FaBuilding, FaArrowLeft, FaMap } from 'react-icons/fa';
import Image from 'next/image';
import { GoogleMap, Marker, StandaloneSearchBox, useLoadScript } from '@react-google-maps/api';
import SignIn from '../../components/SignIn';
import { useAuth } from '../../contexts/AuthContext';
import SkeletonLoader from '../../components/SkeletonLoader';

const CreateAdPage1 = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [userType, setUserType] = useState(null);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState({ lat: 24.7136, lng: 46.6753 }); // Default to Riyadh
  const [locationAddress, setLocationAddress] = useState('');
  const [projectImages, setProjectImages] = useState([]);
  const [soilCheckImages, setSoilCheckImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchBox, setSearchBox] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  useEffect(() => {
    const fetchUserType = async () => {
      if (user && user.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserType(userDoc.data().iseqqquip === 'yes' ? 'equip_use' : 'contractor_use');
        }
      }
    };
    fetchUserType();

    const adData = JSON.parse(localStorage.getItem('adData'));
    if (adData) {
      setCity(adData.city);
      setDistrict(adData.district);
      setPhone(adData.phone);
      setArea(adData.area);
      setLocation(adData.location);
      setProjectImages(adData.projectImages);
      setSoilCheckImages(adData.soilCheckImages);
    }
  }, [user]);

  const handleImageUpload = async (e, setImageState) => {
    setUploading(true);
    const files = Array.from(e.target.files);
    const storage = getStorage();
    
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          console.log(`Uploading file: ${file.name}`);
          const storageRef = ref(storage, `ad-images/${Date.now()}-${file.name}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          console.log(`File uploaded: ${file.name}, URL: ${downloadURL}`);
          return downloadURL;
        })
      );
      
      setImageState((prevImages) => [...prevImages, ...uploadedUrls]);
      console.log('All files uploaded successfully:', uploadedUrls);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (!city || !district || !phone || (userType === 'contractor_use' && !area)) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    const adData = {
      city,
      district,
      phone,
      area,
      location,
      projectImages,
      soilCheckImages,
    };
    localStorage.setItem('adData', JSON.stringify(adData));
    router.push('/create-ad/page2');
  };

  const handleBack = () => {
    router.back();
  };

  const onMapClick = (e) => {
    setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    getAddressFromLatLng(e.latLng.lat(), e.latLng.lng());
  };

  const onMarkerDragEnd = (e) => {
    setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    getAddressFromLatLng(e.latLng.lat(), e.latLng.lng());
  };

  const onPlacesChanged = () => {
    const places = searchBox.getPlaces();
    if (places.length === 0) return;
    const place = places[0];
    setLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    });
    setLocationAddress(place.formatted_address);
  };

  const getAddressFromLatLng = async (lat, lng) => {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setLocationAddress(results[0].formatted_address);
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <SkeletonLoader />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SignIn onClose={() => {}} />
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <button
            className="m-4 float-left text-gray-700 dark:text-gray-300"
            onClick={handleBack}
          >
            <FaArrowLeft className="inline" />
          </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
            {userType === 'equip_use' ? 'إنشاء إعلان تأجير معدات' : 'إنشاء إعلان مشروع'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="city">
                <FaCity className="ml-1" />
                المدينة
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="flex text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="district">
                <FaBuilding className="ml-1" />
                الحي
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                id="district"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="flex text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
                <FaPhone className="ml-1" />
                رقم الهاتف 
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                id="phone"
                type="tel"
                pattern="[0-9]*"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            {userType === 'contractor_use' && (
              <div>
                <label className="flex text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="area">
                  <FaMap className="ml-1" />
                  المساحة
                </label>
                <input
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                  id="area"
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="mt-6">
            <label className="flex text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              <FaMapMarkerAlt className="ml-1" />
              الموقع
            </label>
            <div className="mb-4">
            <div className="flex mb-2 text-sm text-gray-600 dark:text-gray-400">
              <FaMousePointer className="ml-1" />
              يمكنك النقر على الخريطة أو سحب العلامة لتحديد الموقع
            </div>
            <div className="flex mb-2 text-md text-gray-600 dark:text-gray-400">
           أو
            </div>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {showSearch ? 'إخفاء البحث' : 'ابحث عن موقع'}
              </button>
              {showSearch && (
                <StandaloneSearchBox
                  onLoad={ref => setSearchBox(ref)}
                  onPlacesChanged={onPlacesChanged}
                >
                  <div className="mt-2 relative">
                    <input
                      type="text"
                      placeholder="ابحث عن موقع"
                      className="shadow appearance-none border rounded-lg w-full py-2 pl-10 pr-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </StandaloneSearchBox>
              )}
            </div>
          
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '300px' }}
                center={location}
                zoom={10}
                onClick={onMapClick}
                options={mapOptions}
              >
                <Marker
                  position={location}
                  draggable={true}
                  onDragEnd={onMarkerDragEnd}
                />
              </GoogleMap>
            )}
            {locationAddress && (
              <div className="flex mt-2 text-sm text-gray-600 dark:text-gray-400">
                <FaMapMarkerAlt className="ml-1" />
                الموقع المحدد: {locationAddress}
              </div>
            )}
          </div>

          {userType === 'equip_use' ? (
            <div className="mt-6">
              <label className="flex text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                <FaImage className="ml-2" />
                صور للمعدات
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, setProjectImages)}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 dark:file:bg-violet-900 file:text-violet-700
                  hover:file:bg-violet-100 dark:hover:file:bg-violet-800"
              />
              {uploading && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">جاري الرفع...</p>}
              <div className="mt-4 flex overflow-x-auto">
                {projectImages.map((img, index) => (
                  <div key={index} className="flex-shrink-0 mr-2">
                    <Image src={img} alt={`Uploaded image ${index + 1}`} width={100} height={100} objectFit="cover" className="rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="mt-8">
                <label className="flex text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  <FaImage className="ml-2 inline" />
                  صور المشروع
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, setProjectImages)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 dark:file:bg-violet-900 file:text-violet-700
                    hover:file:bg-violet-100 dark:hover:file:bg-violet-800"
                />
                {uploading && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">جاري الرفع...</p>}
                <div className="mt-4 flex overflow-x-auto">
                  {projectImages.map((img, index) => (
                    <div key={index} className="flex-shrink-0 mr-2">
                      <Image src={img} alt={`Uploaded image ${index + 1}`} width={100} height={100} objectFit="cover" className="rounded" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="flex text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  <FaImage className="inline ml-2" />
                  فحص التربة
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, setSoilCheckImages)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 dark:file:bg-violet-900 file:text-violet-700
                    hover:file:bg-violet-100 dark:hover:file:bg-violet-800"
                />
                {uploading && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">جاري الرفع...</p>}
                <div className="mt-4 flex overflow-x-auto">
                  {soilCheckImages.map((img, index) => (
                    <div key={index} className="flex-shrink-0 mr-2">
                      <Image src={img} alt={`Uploaded image ${index + 1}`} width={100} height={100} objectFit="cover" className="rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              onClick={handleNext}
            >
              التالي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdPage1;