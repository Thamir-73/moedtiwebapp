import { useEffect } from 'react';

const BottomSheet = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white p-4 rounded-t-lg shadow-lg flex items-center justify-center z-50">
      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
      {message}
    </div>
  );
};

export default BottomSheet;