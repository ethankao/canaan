/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './js/**/*.js'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require('daisyui')
  ],
  daisyui: { }
}

