/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1e6',
          100: '#ffe2cc',
          200: '#ffc499',
          300: '#ffa666',
          400: '#ff8833',
          500: '#f58220',
          600: '#e06e0c',
          700: '#b85609',
          800: '#903e07',
          900: '#682604',
        },
        secondary: {
          50: '#e8edf5',
          100: '#d1dbea',
          200: '#a3b7d5',
          300: '#7593c0',
          400: '#476fab',
          500: '#1a4b96',
          600: '#133a73',
          700: '#0c2c50',
          800: '#052846',
          900: '#031c32',
        },
        text: {
          primary: '#374151',
          secondary: '#6b7280',
          light: '#9ca3af',
          dark: '#111827',
        },
      },
    },
  },
  plugins: [],
}