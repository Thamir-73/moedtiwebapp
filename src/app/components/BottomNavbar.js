'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';
import { MdFavorite, MdOutlineEditNote, MdSpeakerNotes } from "react-icons/md";

const BottomNavbar = () => {
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  const linkClasses = (path) => 
    `flex-col flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 ${
      pathname === path ? 'text-orange-500 dark:text-orange-500' : ''
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#f8f9fa] dark:bg-[#2c3e50] border-b-2 dark:border-gray-600 backdrop-filter backdrop-blur-lg bg-opacity-70 dark:bg-opacity-70 shadow-lg">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className={linkClasses('/')}>
          <FaHome size={24} />
          <span>الرئيسية</span>
        </Link>
        <Link href="/notifications" className={linkClasses('/notifications')}>
          <MdOutlineEditNote size={24} />
          <span>اعلاناتي</span>
        </Link>
        <Link href="/s" className={linkClasses('/s')}>
          <MdFavorite size={24} />
          <span>المفضلة</span>
        </Link>
        <Link href="/messages" className={linkClasses('/messages')}>
          <MdSpeakerNotes size={24} />
          <span>الدردشات</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavbar;