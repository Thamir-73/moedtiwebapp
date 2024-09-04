import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // Add this import

console.log("Environment variables:", process.env);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Log the config (remove in production)
console.log("Firebase Config:", firebaseConfig);

console.log("Google Maps API Key:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

// Check if all required config values are present
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(`Missing required Firebase configuration keys: ${missingKeys.join(', ')}`);
  throw new Error('Invalid Firebase configuration');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app); // Add this line

// Initialize Analytics
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

async function fetchEquipUseListings() {
  console.log('Fetching equip_use listings...');
  try {
    const q = query(collection(db, 'equip_use'));
    const querySnapshot = await getDocs(q);
    const listings = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('equip_use document data:', data); // Log each document's data
      return {
        id: doc.id,
        ...data
      };
    });
    console.log('Processed equip_use listings:', listings);
    return listings;
  } catch (error) {
    console.error('Error fetching equip_use listings:', error);
    return [];
  }
}

async function fetchContractorUseListings() {
  console.log('Fetching contractor_use listings...');
  try {
    const q = query(collection(db, 'contractor_use'));
    const querySnapshot = await getDocs(q);
    console.log('contractor_use query snapshot:', querySnapshot);
    
    const listings = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('contractor_use document data:', data); // Log each document's data
      return {
        id: doc.id,
        ...data
      };
    });
    
    console.log('Processed contractor_use listings:', listings);
    return listings;
  } catch (error) {
    console.error('Error fetching contractor_use listings:', error);
    return [];
  }
}

const fetchUserById = async (uid) => { // Change parameter name to uid
  try {
    const userDoc = await getDoc(doc(db, 'users', uid)); // Use uid to fetch user
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.log('No such user!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// New function to fetch unique filter values
async function fetchUniqueFilterValues(collectionName) {
  console.log(`Fetching unique filter values from ${collectionName}...`);
  try {
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    const uniqueCities = new Set();
    const uniqueDistricts = new Set();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.city_madinah) uniqueCities.add(data.city_madinah.trim().toLowerCase());
      if (data.city_project) uniqueCities.add(data.city_project.trim().toLowerCase());
      if (data.district_hai) uniqueDistricts.add(data.district_hai.trim().toLowerCase());
      if (data.district_project) uniqueDistricts.add(data.district_project.trim().toLowerCase());
    });

    const filterValues = {
      cities: Array.from(uniqueCities).map(city => city.charAt(0).toUpperCase() + city.slice(1)),
      districts: Array.from(uniqueDistricts).map(district => district.charAt(0).toUpperCase() + district.slice(1)),
    };

    console.log('Fetched unique filter values:', filterValues);
    return filterValues;
  } catch (error) {
    console.error('Error fetching unique filter values:', error);
    return { cities: [], districts: [] };
  }
}

// Single export statement for all needed objects and functions
export { db, analytics, auth, storage, fetchEquipUseListings, fetchContractorUseListings, fetchUserById, fetchUniqueFilterValues };