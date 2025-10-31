/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#ECFF77', // 主色调
          600: '#caec5a',
          700: '#a4c447',
          800: '#7d9c38',
          900: '#5d7329',
          950: '#3a4a1a',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

