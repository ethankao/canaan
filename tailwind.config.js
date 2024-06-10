/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './js/**/*.js'
  ],
  theme: {
    extend: {
      spacing: {
        smenu: 'calc(100vw - 2 * var(--column-spacing) + 10pt)'
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require('daisyui')
  ],
  daisyui: { }
}

