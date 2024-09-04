"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SingleLocationMap from '../../components/SingleLocationMap';
import { FaArrowRight, FaWhatsapp, FaComments, FaCopy, FaMapMarkerAlt, FaCalendar, FaUser, FaHeart, FaChevronLeft, FaExpand, FaTimes, FaBuilding } from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';


const AdDetailPage = ({ params }) => {
  const { id } = params;
  const [adData, setAdData] = useState(null);
  const [equipmentInfo, setEquipmentInfo] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAdData = async () => {
      if (!id) return;

      try {
        let adDoc = await getDoc(doc(db, 'equip_use', id));
        let isEquipUse = true;

        if (!adDoc.exists()) {
          adDoc = await getDoc(doc(db, 'contractor_use', id));
          isEquipUse = false;
        }

        if (adDoc.exists()) {
          const adDataWithId = { ...adDoc.data(), id: adDoc.id, isEquipUse };
          setAdData(adDataWithId);

          // Fetch user data
          const userRef = isEquipUse ? adDataWithId.created_by : adDataWithId.created_byy;
          if (userRef) {
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              setUserData(userDoc.data());
            }
          }

          if (isEquipUse) {
            const equipmentInfoSnapshot = await getDocs(collection(db, 'equip_use', id, 'equipment_info'));
            const equipmentData = equipmentInfoSnapshot.docs.map(doc => doc.data());
            setEquipmentInfo(equipmentData);
          } else {
            const contractorEquipmentSnapshot = await getDocs(collection(db, 'contractor_use', id, 'contractor_equipment'));
            const contractorData = contractorEquipmentSnapshot.docs.map(doc => doc.data());
            setEquipmentInfo(contractorData);
          }
        } else {
          setError('Ad not found');
        }
      } catch (err) {
        console.error('Error fetching ad data:', err);
        setError('Error fetching ad data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdData();
  }, [id]);

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!adData) return <div className="flex justify-center items-center h-screen">No data found</div>;

  const {
    title_of_post,
    post_title,
    equip_photo,
    contractor_img,
    city_madinah,
    city_project,
    district_hai,
    district_project,
    created_att,
    created_at,
    phone_rqm,
    equipmentloca,
    Project_loca,
    description,
    extrainfo,
    extrainfomuq,
    isEquipUse,
    diesel,
    workers,
    areamuq,
    Equip_Nuum,
    soilcheckmuq
  } = adData;

  const title = title_of_post || post_title;
  const city = city_madinah || city_project;
  const district = district_hai || district_project;
  const createdDate = created_att || created_at;
  const location = equipmentloca || Project_loca;
  const images = equip_photo || contractor_img || [];
  const extraInformation = extrainfo || extrainfomuq;

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="container mx-auto p-4">
      <div className="flex-col">
        <div className="flex">
      <button
  onClick={() => router.back()}
  className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
>
  <FaArrowRight className="mr-2 size-7 text-orange-400" />
</button></div>
<div className="flex items-center justify-center">
 <h1 className="text-3xl md:text-4xl items-center justify-center leading-tight tracking-tight text-slate-500 dark:text-slate-300 prose prose-lg max-w-none prose-slate dark:prose-invert max-w-4xl pt-1 pb-4 border-b-2 border-slate-200 dark:border-slate-600">
  {isEquipUse ?  "صاحب المشروع" : "اعلان ايجار معدات ثقيلة"}
</h1></div></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-6"
        >
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">{title}</h1>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <InfoItem label={isEquipUse ? "صاحب المعدات" : "صاحب المشروع"} value={userData?.display_name || 'Unknown User'} icon={<FaUser />} />
                <InfoItem label="المدينة" value={city} icon={<FaMapMarkerAlt />} />
                <InfoItem label="الحي" value={district} icon={<FaBuilding />} />
                <InfoItem label="تاريخ النشر" value={createdDate?.toDate().toLocaleDateString()} icon={<FaCalendar />} />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-6">
            <ActionButton icon={<FaComments />} text="محادثة" />
              <ActionButton icon={<FaCopy />} text="انسخ الرقم" />
              <ActionButton icon={<FaWhatsapp />} text="واتساب" />
              <ActionButton icon={<FaHeart />} text="تفضيل" />
            </div>
          

            <ImageGallery images={images} title={title} setExpandedImage={setExpandedImage} />

            </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-6"
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">التفاصيل</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailCard title="رقم الجوال" content={phone_rqm} />
              {description && <DetailCard title="الوصف" content={description} />}
              {extraInformation && <DetailCard title="معلومات اضافية" content={extraInformation} />}
              {diesel && <DetailCard title="الديزل" content={diesel} />}
              {workers && <DetailCard title="العمال" content={workers} />}
              {areamuq && <DetailCard title="المساحة" content={areamuq} />}
              {Equip_Nuum && <DetailCard title="عدد المعدات" content={Equip_Nuum} />}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-6"
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">الموقع</h2>
            {location && typeof location.latitude === 'number' && typeof location.longitude === 'number' ? (
              <SingleLocationMap location={{
                lat: location.latitude,
                lng: location.longitude
              }} />
            ) : (
              <p className="text-lg">معلومات الموقع غير متوفرة حاليا</p>
            )}
          </div>
        </motion.div>

        {equipmentInfo.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">المعدات المضافة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {equipmentInfo.map((item, index) => (
                  <EquipmentCard key={index} item={item} isEquipUse={isEquipUse} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {soilcheckmuq && soilcheckmuq.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white shadow-lg rounded-lg overflow-hidden mb-6"
          >
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">فحص التربة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {soilcheckmuq.map((image, index) => (
                  <div key={index} className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
                    <Image 
                      src={image} 
                      alt={`Soil Check Image ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className="cursor-pointer"
                      onClick={() => setExpandedImage(image)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setExpandedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <Image 
                src={expandedImage} 
                alt="Expanded Image"
                width={800}
                height={600}
                objectFit="contain"
              />
              <button 
                className="absolute top-4 right-4 text-white text-2xl"
                onClick={() => setExpandedImage(null)}
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <div className="flex items-center text-sm sm:text-base">
    <span className="mr-2 text-gray-600">{icon}</span>
    <span><strong>{label}:</strong> {value}</span>
  </div>
);

const ActionButton = ({ icon, text }) => (
  <button className="flex flex-col items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 sm:py-3 sm:px-4 rounded transition duration-300">
    <span className="text-lg sm:text-xl mb-1">{icon}</span>
    <span className="text-xs sm:text-sm">{text}</span>
  </button>
);


const ImageGallery = ({ images, title, setExpandedImage }) => (
    <div className="mt-6 mb-6 relative">
      <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
        {images.length > 0 ? (
          images.map((image, index) => (
            <div key={index} className="inline-block mr-4 last:mr-0">
              <div className="relative">
                <Image 
                  src={image} 
                  alt={`${title} - Image ${index + 1}`} 
                  width={250} 
                  height={187} 
                  objectFit="cover"
                  className="rounded-lg cursor-pointer"
                  onClick={() => setExpandedImage(image)}
                />
                <button 
                  className="absolute bottom-2 right-2 bg-white bg-opacity-75 p-1 rounded-full"
                  onClick={() => setExpandedImage(image)}
                >
                  <FaExpand className="text-gray-700" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-200 w-full h-48 flex items-center justify-center rounded-lg">
            <p className="text-gray-500 text-lg">No images available</p>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-l-lg shadow-md">
          <FaChevronLeft className="text-gray-600 text-xl" />
        </div>
      )}
    </div>
  );

const DetailCard = ({ title, content }) => (
  <div className="bg-gray-50 p-3 rounded-lg shadow">
    <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
    <p className="text-gray-600">{content}</p>
  </div>
);

const EquipmentCard = ({ item, isEquipUse }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow">
    <p className="text-lg mb-2"><strong>النوع:</strong> {item.Kind || item.kind || 'N/A'}</p>
    <p className="text-lg mb-2"><strong>الموديل:</strong> {item.Model || item.model || 'N/A'}</p>
    {isEquipUse && <p className="text-lg mb-2"><strong>السنة:</strong> {item.Year || 'N/A'}</p>}
    <p className="text-lg">
      <strong>المدة الزمنية المتاحة للايجار:</strong> {
        Array.isArray(item.rent_span) 
          ? item.rent_span.join(', ')
          : typeof item.rent_span === 'string'
            ? item.rent_span
            : 'N/A'
      }
    </p>
  </div>
);

const SkeletonLoader = () => (
  <div className="container mx-auto p-4 bg-gray-100">
    <div className="bg-white shadow-lg rounded-lg overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-48 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AdDetailPage;