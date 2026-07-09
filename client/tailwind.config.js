/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7ff',
          100: '#e6ecff',
          500: '#4f5df6',
          600: '#3f4bd9',
          700: '#333db0',
        },
      },
    },
  },
  plugins: [],
};
