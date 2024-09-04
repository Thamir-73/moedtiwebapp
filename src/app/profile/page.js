'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../utils/firebase';
import Image from 'next/image';
import { FaBuilding, FaPhone, FaEnvelope, FaIdCard, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '../contexts/DarkModeContext';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sjltejari, setSjltejari] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState({});
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setPhone(user.phone_number || '');
      setEmail(user.email || '');
      setSjltejari(user.sjltejari || '');
      setImagePreview(user.photo_url || null);
      setInitialData({
        display_name: user.display_name || '',
        phone: user.phone_number || '',
        email: user.email || '',
        sjltejari: user.sjltejari || '',
        photo_url: user.photo_url || null
      });
      setLoading(false);
    }
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

      const updateData = {};

      if (displayName !== initialData.display_name) updateData.display_name = displayName;
      if (phone !== initialData.phone) updateData.phone_number = phone;
      if (email !== initialData.email) updateData.email = email;
      if (sjltejari !== initialData.sjltejari) updateData.sjltejari = sjltejari;
      if (photoUrl !== initialData.photo_url) updateData.photo_url = photoUrl;

      if (Object.keys(updateData).length > 0) {
        console.log('Updating user document with:', updateData);
        await updateDoc(doc(db, 'users', user.uid), updateData);
        console.log('Profile updated successfully');
        setShowBottomSheet(true);
        setTimeout(() => {
          setShowBottomSheet(false);
          router.back();
        }, 2000);
      } else {
        console.log('No changes to update');
        alert('لم يتم إجراء أي تغييرات');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('حدث خطأ أثناء تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-pulse bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-3xl h-[80vh]">
          <div className="h-40 w-40 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-6"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-4/6 mb-6"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full mb-6"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-3xl">
        <button
          onClick={handleBack}
          className="mb-4 text-blue-500 float-left dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
        >
          <FaArrowLeft className="inline ml-2" />
        
        </button>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">الملف الشخصي</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-400 hover:border-blue-600 dark:hover:border-blue-300 transition-colors">
              {imagePreview ? (
                <Image src={imagePreview} alt="Profile" layout="fill" objectFit="cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-4xl">صورة</span>
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
            <FaBuilding className="absolute top-3 right-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="اسم الشركة/المؤسسة"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-right"
            />
          </div>
          <div className="relative">
            <FaPhone className="absolute top-3 right-3 text-gray-400 dark:text-gray-500" />
            <input
              type="tel"
              placeholder="رقم الهاتف"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-right"
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute top-3 right-3 text-gray-400 dark:text-gray-500" />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-right"
            />  
          </div>
          {user && user.iseqqquip === 'no' && (
            <div className="relative">
              <FaIdCard className="absolute top-3 right-3 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="رقم السجل التجاري"
                value={sjltejari}
                onChange={(e) => setSjltejari(e.target.value)}
                className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-right"
              />
            </div>
          )}
         
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 justify-end rounded-lg hover:bg-blue-600 transition-colors font-semibold dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            تحديث الملف الشخصي
          </button>
          </form>

      </div>
      {showBottomSheet && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white p-4 text-center transition-transform duration-300 transform translate-y-0 z-50">
          <FaCheck className="inline-block mr-2" />
          تم تحديث بياناتك بنجاح
        </div>
      )}
    </div>
  );
}