// src/components/UserTypeModal.js
import { motion } from 'framer-motion';

export default function UserTypeModal({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray dark:bg-[#2c3e50] border-b-2 dark:border-gray-600 backdrop-filter backdrop-blur-lg bg-opacity-70 dark:bg-opacity-70 p-6 rounded-lg shadow-xl max-w-sm w-[80%] lg:w-full"
    >
      <h2 className="text-xl font-bold mb-4 text-center">اختر احتياجك</h2>
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => onSelect('yes')}
          className="p-2 text-gray-700 dark:text-gray-300 border border-2 border-yellow-300 rounded-xl hover:shadow-3xl transition-colors"
        >
          مزود معدّات
        </button>
        <button
          onClick={() => onSelect('no')}
          className="p-2 text-gray-700 dark:text-gray-300 border border-2 border-orange-300 rounded-xl hover:shadow-3xl transition-colors"
        >
          مُستاجر معدّات
        </button>
      </div>
    </motion.div>
  );
}