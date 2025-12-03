import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      // Only use saved theme if it exists, otherwise default to light
      return savedTheme || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Apply theme immediately on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Prevent automatic theme detection on mount
  useEffect(() => {
    // Remove any automatic dark mode detection
    const root = document.documentElement;
    // Ensure we start with the saved theme, not system preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#444] bg-white/80 dark:bg-[#232526]/80 text-gray-700 dark:text-gray-200 shadow-[0_2px_12px_0_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_0_rgba(0,0,0,0.25)] transition font-semibold hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
      onClick={toggleTheme}
      aria-label="Toggle light/dark mode"
    >
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}

export default ThemeToggle; 