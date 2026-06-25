/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        violet: { 600: '#7c3aed', 700: '#6d28d9' },
      },
    },
  },
  plugins: [],
};
