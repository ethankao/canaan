/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './js/**/*.js'
  ],
  theme: {
    extend: {
      spacing: {
        smenu: 'calc(100vw - 12pt)'
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require('daisyui')
  ],
  daisyui: { }
}

