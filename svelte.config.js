import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ...mdsvexConfig.extensions],

  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
    }),
    mdsvex(mdsvexConfig),
  ],

  kit: {
    adapter: adapter(),
    package: {
      exports: (filepath) => {
        return filepath.endsWith("index.js");
      },
      files: (filepath) => {
        return !filepath.endsWith(".test.ts");
      },
    },

    // hydrate the <div id="svelte"> element in src/app.html
    target: "#svelte",
  },
};

export default config;
