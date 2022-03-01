const config = {
  content: ["./src/**/*.{html,js,svelte,ts,svx}"],

  theme: {
    extend: {},
  },

  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require("@tailwindcss/typography"),
  ],
};

module.exports = config;
