/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f0f4',
          100: '#e7e1e9', 
          500: '#38003c',
          600: '#2d0030',
          700: '#220024',
          800: '#170018',
          900: '#0c000c',
        },
        accent: '#00ff87'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

