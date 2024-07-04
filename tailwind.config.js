/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/views/**/*.{ejs,jsx,ts,tsx}",
            "./node_modules/tw-elements/js/**/*.js"
           ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui"), require("tw-elements/plugin.cjs")],
  daisyui: {
    themes: [
      "light",
      "retro",
    ],
  },
}

