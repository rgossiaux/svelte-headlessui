const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
  },

  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
};

module.exports = config;
