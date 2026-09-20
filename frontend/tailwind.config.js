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
        cyber: {
          darkest: '#04070a',
          darker: '#080d11',
          dark: '#0c1417',
          card: '#10191c',
          border: '#18262a',
          accent: '#00e599', // Ultra-vibrant Cyber Emerald
          emerald: '#00e599',
          sage: '#10b981',
          forest: '#059669',
          titanium: '#94a3b8',
          rose: '#f43f5e',
          amber: '#f59e0b',
          gold: '#eab308',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
