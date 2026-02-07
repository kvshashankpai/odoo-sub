/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#714B67', // Odoo purple
        secondary: '#017E84', // Teal
      }
    },
  },
  plugins: [],
}