/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        priority: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#ef4444',
        },
        status: {
          todo: '#6b7280',
          'in-progress': '#3b82f6',
          done: '#10b981',
        }
      },
    },
  },
  plugins: [],
}