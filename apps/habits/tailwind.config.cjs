const path = require("path");
const JOURNAL_GLOB = path.resolve(__dirname, "../../src/**/*.{js,jsx}");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    path.resolve(__dirname, "src/**/*.{js,jsx}"),
    JOURNAL_GLOB,
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
