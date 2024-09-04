import { FaSun, FaMoon } from 'react-icons/fa';

export default function DarkModeToggle({ darkMode, setDarkMode }) {
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700" />}
    </button>
  );
}