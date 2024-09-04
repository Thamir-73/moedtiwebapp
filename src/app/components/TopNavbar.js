'use client';
import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDarkMode } from '../contexts/DarkModeContext';
import DarkModeToggle from './DarkModeToggle';
import dynamic from 'next/dynamic';
import { useAuth } from '../contexts/AuthContext';
import Notification from './Notification';
import { useRouter } from 'next/navigation';
import { FaUser, FaBars, FaTimes } from 'react-icons/fa';

const SignIn = dynamic(() => import('./SignIn'), { ssr: false });

const TopNavbar = () => {
  const { darkMode, setDarkMode } = useDarkMode();
  const { user, signOut, authChecked } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [notification, setNotification] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setNotification({ message: 'تم تسجيل الخروج بنجاح', type: 'success' });
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setNotification({ message: 'حدث خطأ أثناء تسجيل الخروج', type: 'error' });
    }
  }, [signOut]);

  const handleSignInSuccess = useCallback(() => {
    setNotification({ message: 'تم تسجيل الدخول بنجاح', type: 'success' });
    setMobileMenuOpen(false);
  }, []);

  const handleOpenSignIn = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('previousPath', window.location.pathname);
    }
    setShowSignIn(true);
    setMobileMenuOpen(false);
  }, []);

  const handleProfileClick = useCallback(() => {
    router.push('/profile');
    setMobileMenuOpen(false);
  }, [router]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-[#f8f9fa] dark:bg-[#2c3e50] border-b-2 dark:border-gray-600 backdrop-filter backdrop-blur-lg bg-opacity-70 dark:bg-opacity-70 shadow-lg z-50">
        <div className="flex justify-between items-center h-16 px-4">
          <Link href="/" className="flex items-center">
            <Image src="/originlog.png" alt="Logo" width={100} height={100} />
          </Link>
          <div className="flex items-center">
            <div className="flex items-center ml-2">
              <div className="flex items-center px-2 lg:px-1">
                <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
              </div>
              {!authChecked ? (
                <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              ) : !user ? (
                <button
                  onClick={handleOpenSignIn}
                  className="px-3 py-2 md:px-4 md:py-2 border border-orange-400 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors relative text-sm md:text-base"
                >
                  تسجيل دخول
                </button>
              ) : (
                <button
                  className="md:hidden text-gray-700 dark:text-gray-300"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
              )}
            </div>
            {user && (
              <div className="hidden md:flex items-center mr-4">
                 <button
                  onClick={handleProfileClick}
                  className="ml-2 flex items-center px-3 py-2 border border-orange-400 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors relative"
                >
                  <span className="font-semibold">
                    {user.display_name || user.email || 'المستخدم'}
                  </span>
                  <FaUser className="mr-2" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 border border-orange-400 text-gray-700 rounded-xl dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900 transition-colors relative"
                >
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
        {user && mobileMenuOpen && (
          <div className="md:hidden bg-[#f8f9fa] dark:bg-[#2c3e50] py-4 px-4 space-y-4">
            <button
              onClick={handleProfileClick}
              className="w-full text-right flex justify-center items-center px-3 py-2 border border-orange-400 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors relative"
            >
              <span className="font-semibold ml-2">
              <FaUser />
              </span>
              {user.display_name || user.email || 'المستخدم'}
            </button>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 justify-center items-center border border-orange-400 text-gray-700 rounded-xl dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900 transition-colors relative"
            >
              تسجيل الخروج
            </button>
          </div>
        )}
     </nav>
      {showSignIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <SignIn onClose={() => setShowSignIn(false)} onSignInSuccess={handleSignInSuccess} />
        </div>
      )}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default memo(TopNavbar);