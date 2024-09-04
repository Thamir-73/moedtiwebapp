'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../utils/firebase';
import Image from 'next/image';
import { FaBuilding, FaInfoCircle, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import { getUserType } from '../utils/userType';

export default function FinishInfo() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [comBio, setComBio] = useState('');
  const [comLocat, setComLocat] = useState('');
  const [sjltejari, setSjltejari] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const initializeUser = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (userData.isfirttime === 'no') {
          window.location.href = '/';
          return;
        }

        if (userData.iseqqquip === 'yes' || userData.iseqqquip === 'no') {
          setUserType(userData.iseqqquip);
        } else {
          const localUserType = getUserType();
          if (localUserType) {
            setUserType(localUserType);
          }
        }

        setLoading(false);
      }
    };

    initializeUser();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    
    const storageRef = ref(storage, `profileImages/${user.uid}/${Date.now()}-${file.name}`);
    
    try {
      console.log('Starting file upload...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('File uploaded successfully. Metadata:', snapshot.metadata);
      
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      if (error.code) console.error("Error code:", error.code);
      if (error.message) console.error("Error message:", error.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      let photoUrl = user.photo_url;

      if (profileImage) {
        console.log('Attempting to upload profile image...');
        photoUrl = await handleImageUpload(profileImage);
        if (!photoUrl) {
          console.error('Failed to upload profile image');
        } else {
          console.log('Profile image uploaded successfully:', photoUrl);
        }
      }

      const updateData = {
        isfirttime: 'no',
      };

      if (displayName) updateData.display_name = displayName;
      if (comBio) updateData.com_bio = comBio;
      if (comLocat) updateData.com_locat = comLocat;
      if (sjltejari) updateData.sjltejari = sjltejari;
      if (photoUrl) updateData.photo_url = photoUrl;
      if (userType) updateData.iseqqquip = userType;

      console.log('Updating user document with:', updateData);
      await updateDoc(doc(db, 'users', user.uid), updateData);

      console.log('Profile updated successfully');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile. Please try again.');
    }
  };

  const handleLater = async () => {
    if (!user) return;
    try {
      const updateData = {
        isfirttime: 'no',
      };
      if (userType) updateData.iseqqquip = userType;

      await updateDoc(doc(db, 'users', user.uid), updateData);
      window.location.href = '/';
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-pulse bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <div className="h-32 w-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-4/6 mb-4"></div>
          <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">اكمال معلومات حسابك</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 hover:border-blue-600 transition-colors">
              {imagePreview ? (
                <Image src={imagePreview} alt="Profile" layout="fill" objectFit="cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-4xl">صورة</span>
                </div>
              )}
              <label htmlFor="profile-image-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-sm">تغيير الصورة</span>
              </label>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
          <div className="relative">
            <FaBuilding className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="اسم الشركة/المؤسسة"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <FaInfoCircle className="absolute top-3 left-3 text-gray-400" />
            <textarea
              placeholder="نبذة عن الشركة"
              value={comBio}
              onChange={(e) => setComBio(e.target.value)}
              className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
            />
          </div>
          <div className="relative">
            <FaMapMarkerAlt className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="موقع الشركة"
              value={comLocat}
              onChange={(e) => setComLocat(e.target.value)}
              className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <FaIdCard className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="رقم السجل التجاري"
              value={sjltejari}
              onChange={(e) => setSjltejari(e.target.value)}
              className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {!userType && (
            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">نوع الحساب:</p>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleUserTypeChange('yes')}
                  className={`px-4 py-2 rounded-lg ${
                    userType === 'yes' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  مقاول
                </button>
                <button
                  type="button"
                  onClick={() => handleUserTypeChange('no')}
                  className={`px-4 py-2 rounded-lg ${
                    userType === 'no' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  صاحب معدات
                </button>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            الحفظ
          </button>
        </form>
        <button
          onClick={handleLater}
          className="w-full text-blue-500 mt-4 hover:underline font-semibold"
        >
          الاكمال لاحقًا
        </button>
      </div>
    </div>
  );
}