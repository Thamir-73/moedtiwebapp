import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function SignIn({ onClose, onSignInSuccess }) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const auth = getAuth();

  const handleEmailSignIn = async () => {
    setIsProcessing(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSignInSuccess();
      onClose();
      const previousPath = sessionStorage.getItem('previousPath') || '/';
      window.location.href = previousPath;
    } catch (error) {
      console.error('Error signing in with email:', error);
      alert('Error signing in with email. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailSignUp = async () => {
    setIsProcessing(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        isfirttime: 'yes',
      });
      window.location.href = '/finish-info';
    } catch (error) {
      console.error('Error signing up with email:', error);
      alert('Error signing up with email. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const ButtonLoader = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl relative w-full max-w-md">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="البريد الإلكتروني"
        className="w-full p-2 mb-4 border rounded text-right"
        dir="ltr"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="كلمة المرور"
        className="w-full p-2 mb-4 border rounded text-right"
        dir="ltr"
      />
      <button 
        onClick={handleEmailSignIn}
        className="w-full px-4 py-2 bg-orange-300 text-gray-700 rounded hover:bg-orange-400 transition-colors mb-2 flex items-center justify-center"
        disabled={isProcessing}
      >
        {isProcessing ? <ButtonLoader /> : 'تسجيل الدخول'}
      </button>
      <button 
        onClick={handleEmailSignUp}
        className="w-full px-4 py-2 bg-blue-300 text-gray-700 rounded hover:bg-blue-400 transition-colors flex items-center justify-center"
        disabled={isProcessing}
      >
        {isProcessing ? <ButtonLoader /> : 'إنشاء حساب جديد'}
      </button>
    </div>
  );
}