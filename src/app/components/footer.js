import React from 'react';
import { FaTwitter, FaYoutube, FaCopyright } from 'react-icons/fa';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-900 py-8 mb-[40rem]"> {/* Added mb-16 for bottom navbar space */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <div className="flex justify-center space-x-4 mb-8">
          <a className="px-5" href="https://docs.google.com/forms/d/e/1FAIpQLSfk_yOaTX3AH-STCzl9EkTRZ0kIzkfYlsUm9EN02-KK-J2K0w/viewform?usp=sf_link" target="_blank" rel="noopener noreferrer">
            <Image
              src="/googl.webp"
              alt="Download on the App Store"
              width={135}
              height={40}
            />
          </a>
          <a href="https://apps.apple.com/sa/app/%D9%85%D8%B9%D8%AF-%D8%AA%D9%8A/id6502878267" target="_blank" rel="noopener noreferrer">
            <Image
              src="/appstore.png"
              alt="Get it on Google Play"
              width={135}
              height={40}
            />
          </a>
        </div>
        <div className="flex justify-center space-x-6 mb-6">
          <a href="" className="text-gray-400 px-5 hover:text-gray-500 dark:hover:text-gray-300">
            <FaTwitter className="h-6 w-6" />
          </a>
          <a href="" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <FaYoutube className="h-6 w-6" />
          </a>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400 flex items-center justify-center">
          <FaCopyright className="mr-2" />
          <span>٢٠٢٤ معدتي.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;