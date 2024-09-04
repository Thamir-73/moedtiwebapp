import { useState, useEffect } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function SignIn({ onClose, onSignInSuccess }) {
  const { user } = useAuth();
  const [showEmailSignIn, setShowEmailSignIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessingSend, setIsProcessingSend] = useState(false);
  const [isProcessingVerify, setIsProcessingVerify] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    // Set language code
    auth.languageCode = 'ar'; // Set to Arabic, change as needed

    // Initialize invisible reCAPTCHA
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'send-code-button', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        handleSendCode();
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        console.log('reCAPTCHA expired');
        // You might want to show a message to the user here
      }
    });

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, [auth]);

  useEffect(() => {
    if (user) {
      checkUserStatus();
    }
  }, [user]);

  const checkUserStatus = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().isfirttime !== 'no') {
          window.location.href = '/finish-info';
        } else {
          onSignInSuccess();
          onClose();
          const previousPath = sessionStorage.getItem('previousPath') || '/';
          window.location.href = previousPath;
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    }
  };

  const formatPhoneNumber = (number) => {
    const digits = number.replace(/\D/g, '');
    return digits.startsWith('966') ? `+${digits}` : `+966${digits}`;
  };

  const handleSendCode = async () => {
    setIsProcessingSend(true);
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmationResult);
    } catch (error) {
      console.error('Error sending code:', error);
      console.error('Error name:', error.name);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsProcessingSend(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult) return;
    setIsProcessingVerify(true);
    try {
      await confirmationResult.confirm(verificationCode);
    } catch (error) {
      console.error('Error verifying code:', error);
    } finally {
      setIsProcessingVerify(false);
    }
  };

  const handleEmailSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        isfirttime: 'yes',
      });
    } catch (error) {
      console.error('Error signing up with email:', error);
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
      {!showEmailSignIn ? (
        <>
          {!confirmationResult ? (
            <>
              <div className="mb-4">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="966556228423"
                  className="w-full p-2 border rounded"
                  dir="ltr"
                />
              </div>
              <button 
                id="send-code-button"
                onClick={handleSendCode}
                className="w-full px-4 py-2 bg-orange-300 text-gray-700 rounded hover:bg-orange-400 transition-colors flex items-center justify-center"
                disabled={isProcessingSend}
              >
                {isProcessingSend ? (
                  <>
                    <ButtonLoader />
                  </>
                ) : (
                  'إرسال الرمز'
                )}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="رمز التحقق"
                className="w-full p-2 mb-4 border rounded"
                dir="ltr"
              />
              <button 
                onClick={handleVerifyCode}
                className="w-full px-4 py-2 bg-orange-300 text-gray-700 rounded hover:bg-orange-400 transition-colors flex items-center justify-center"
                disabled={isProcessingVerify}
              >
                {isProcessingVerify ? (
                  <>
                    <ButtonLoader />
                  </>
                ) : (
                  'التحقق'
                )}
              </button>
            </>
          )}
          <button 
            onClick={() => setShowEmailSignIn(true)}
            className="mt-4 text-sm text-blue-500 hover:text-blue-700 w-full text-center"
          >
            تسجيل الدخول بالبريد الإلكتروني
          </button>
        </>
      ) : (
        <>
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
            className="w-full px-4 py-2 bg-orange-300 text-gray-700 rounded hover:bg-orange-400 transition-colors mb-2"
          >
            تسجيل الدخول
          </button>
          <button 
            onClick={handleEmailSignUp}
            className="w-full px-4 py-2 bg-blue-300 text-gray-700 rounded hover:bg-blue-400 transition-colors"
          >
            إنشاء حساب جديد
          </button>
          <button 
            onClick={() => setShowEmailSignIn(false)}
            className="mt-4 text-sm text-blue-500 hover:text-blue-700 w-full text-center"
          >
            العودة إلى تسجيل الدخول برقم الهاتف
          </button>
        </>
      )}
    </div>
  );
}