"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import SignIn from '../../components/SignIn';
import { useAuth } from '../../contexts/AuthContext';
import SkeletonLoader from '../../components/SkeletonLoader';
import BottomSheet from '../../components/BottomSheet';

const CreateAdPage2 = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [userType, setUserType] = useState(null);
  const [title, setTitle] = useState('');
  const [titleCharCount, setTitleCharCount] = useState(0);
  const [description, setDescription] = useState('');
  const [equipments, setEquipments] = useState([{ kind: '', model: '', rent_span: userType === 'equip_use' ? [] : '' }]);
  const [diesel, setDiesel] = useState('');
  const [workers, setWorkers] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  useEffect(() => {
    const adData = JSON.parse(localStorage.getItem('adData'));
    if (!adData) {
      router.push('/create-ad/page1');
    }
    const fetchUserType = async () => {
      if (user && user.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserType(userDoc.data().iseqqquip === 'yes' ? 'equip_use' : 'contractor_use');
        }
      }
    };
    fetchUserType();
  }, [router, user]);

  const handleEquipmentChange = (index, field, value) => {
    const newEquipments = [...equipments];
    newEquipments[index][field] = value;
    setEquipments(newEquipments);
  };

  const handleRentSpanChange = (index, value) => {
    const newEquipments = [...equipments];
    if (userType === 'contractor_use') {
      newEquipments[index].rent_span = value;
    } else {
      const currentSpans = newEquipments[index].rent_span;
      if (currentSpans.includes(value)) {
        newEquipments[index].rent_span = currentSpans.filter(span => span !== value);
      } else {
        newEquipments[index].rent_span = [...currentSpans, value];
      }
    }
    setEquipments(newEquipments);
  };

  const addEquipment = () => {
    setEquipments([...equipments, { kind: '', model: '', rent_span: userType === 'equip_use' ? [] : '' }]);
  };

  const removeEquipment = (index) => {
    const newEquipments = equipments.filter((_, i) => i !== index);
    setEquipments(newEquipments);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to create an ad');
      return;
    }

    const adData = JSON.parse(localStorage.getItem('adData'));
    const newAdData = userType === 'equip_use' ? {
      equip_photo: adData.projectImages,
      district_hai: adData.district,
      city_madinah: adData.city,
      title_of_post: title,
      is_active: true,
      created_by: doc(db, 'users', user.uid),
      equipNumm: equipments.length,
      phone_rqm: adData.phone,
      extrainfo: extraInfo,
      equipmentloca: new GeoPoint(adData.location.lat, adData.location.lng),
      description: description,
      created_att: serverTimestamp(),
    } : {
      contractor_img: adData.projectImages,
      district_project: adData.district,
      city_project: adData.city,
      post_title: title,
      is_active: true,
      created_byy: doc(db, 'users', user.uid),
      Equip_Nuum: equipments.length,
      phone_rqm: adData.phone,
      extrainfomuq: extraInfo,
      Project_loca: new GeoPoint(adData.location.lat, adData.location.lng),
      description: description,
      created_at: serverTimestamp(),
      diesel: diesel,
      workers: workers,
      areamuq: adData.area,
    };

    try {
      console.log('Submitting ad data:', newAdData);
      const adDocRef = await addDoc(collection(db, userType), newAdData);
      console.log('Ad created with ID:', adDocRef.id);
      
      // Add equipment info to subcollection
      for (const equipment of equipments) {
        console.log('Adding equipment:', equipment);
        await addDoc(collection(db, userType, adDocRef.id, `${userType === 'equip_use' ? 'equipment_info' : 'contractor_equipment'}`), equipment);
      }

      localStorage.removeItem('adData');
      setShowBottomSheet(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error creating ad:', error);
      alert('Error creating ad. Please try again.');
    }
  };

  const handleBack = () => {
    router.push('/create-ad/page1');
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!user) {
    return <SignIn onClose={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <button
            className="m-4 float-left text-gray-700 dark:text-gray-300"
            onClick={handleBack}
          >
            <FaArrowLeft className="inline mr-2" />
          </button>
        <div className="p-8">
        
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
            {userType === 'equip_use' ? 'إنشاء إعلان تأجير معدات' : 'إنشاء إعلان مشروع'}
          </h2>
          
          <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="title">
                عنوان الإعلان
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  const newTitle = e.target.value.slice(0, 70);
                  setTitle(newTitle);
                  setTitleCharCount(newTitle.length);
                }}
                maxLength={70}
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {titleCharCount}/70 حرف
              </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
              وصف الإعلان
            </label>
            <textarea
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">المعدات</h3>
            {equipments.map((equipment, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg relative">
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`kind-${index}`}>
                    نوع المعدات
                  </label>
                  <input
                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                    id={`kind-${index}`}
                    type="text"
                    value={equipment.kind}
                    onChange={(e) => handleEquipmentChange(index, 'kind', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`model-${index}`}>
                    موديل المعدات
                  </label>
                  <input
                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                    id={`model-${index}`}
                    type="text"
                    value={equipment.model}
                    onChange={(e) => handleEquipmentChange(index, 'model', e.target.value)}
                    required
                  />
                </div>

                {userType === 'equip_use' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`year-${index}`}>
                      سنة الصنع
                    </label>
                    <input
                      className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                      id={`year-${index}`}
                      type="text"
                      value={equipment.year}
                      onChange={(e) => handleEquipmentChange(index, 'year', e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    مدة الإيجار
                  </label>
                  <div className="flex flex-wrap">
                    {['يومي', 'شهري', 'سنوي'].map((span) => (
                      <label key={span} className="inline-flex items-center mr-4 mb-2">
                        <input
                          type={userType === 'contractor_use' ? 'radio' : 'checkbox'}
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={userType === 'contractor_use' ? equipment.rent_span === span : equipment.rent_span.includes(span)}
                          onChange={() => handleRentSpanChange(index, span)}
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{span}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => removeEquipment(index)}
                  className="absolute top-2 left-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              onClick={addEquipment}
              className="bg-green-500 hover:shadow-xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
            >
              <FaPlus className="mr-2" /> إضافة معدات
            </button>
          </div>

          {userType === 'contractor_use' && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">الديزل</label>
                <select
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                  value={diesel}
                  onChange={(e) => setDiesel(e.target.value)}
                >
                  <option value="">اختر</option>
                  <option value="علي">علي</option>
                  <option value="على صاحب المعدة">على صاحب المعدة</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">سكن العمال</label>
                <select
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                  value={workers}
                  onChange={(e) => setWorkers(e.target.value)}
                >
                  <option value="">اختر</option>
                  <option value="علي">علي</option>
                  <option value="على صاحب المعدة">على صاحب المعدة</option>
                </select>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="extraInfo">
              معلومات إضافية
            </label>
            <textarea
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
              id="extraInfo"
              rows="4"
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
            ></textarea>
          </div>

          <div className="mt-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSubmit}
            >
              إنشاء الإعلان
            </button>
          </div>
        </div>
      </div>
      {showBottomSheet && (
        <BottomSheet
          message="تم نشر الإعلان بنجاح"
          onClose={() => setShowBottomSheet(false)}
        />
      )}
    </div>
  );
};

export default CreateAdPage2;