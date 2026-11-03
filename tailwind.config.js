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
        ink: {
          DEFAULT: '#07080a',
          2: '#101218',
          3: '#181b22',
        },
        lime: {
          DEFAULT: '#c8f542',
          dim: 'rgba(200, 245, 66, 0.14)',
        },
        gym: {
          dark: '#07080a',
          card: '#101218',
          border: '#27272a',
          accent: '#c8f542',
          accentHover: '#b6e235',
          danger: '#ff5c5c',
          warning: '#ffb020',
          info: '#38bdf8',
          gold: '#eab308',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
