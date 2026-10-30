/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#ea580c', dark: '#c2410c' }, // orange-600 / -700
      },
    },
  },
  plugins: [],
};
