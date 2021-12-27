const colors = require('tailwindcss/colors');

const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      fontFamily: {
        'body': ['Inter', 'Roboto', 'Aria', 'sans-serif']
      },
      colors: {
        gray: colors.neutral,
        svelte: {
          light: '#ff6432',
          DEFAULT: '#ff3e00',
          dark: '#cc3100'
        }
      }
    },
  },

  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require('@tailwindcss/typography')
  ],
};

module.exports = config;
