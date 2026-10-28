/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gym: {
          dark: '#0a0a0c',
          card: '#121217',
          border: '#27272a',
          accent: '#10b981', // Emerald green
          accentHover: '#059669',
          danger: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          gold: '#eab308',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
