import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";
import path from "path";
import unoCss from "unocss/vite";
import unoConfig from "./uno.config.js";
import { mdsvex } from "mdsvex";
import rehypeSlug from "rehype-slug";
import prism from "prismjs";
import "prism-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  extensions: [".svelte", ".md"],
  preprocess: [
    preprocess(),
    mdsvex({
      extensions: [".md"],
      rehypePlugins: [rehypeSlug],
      highlight: function (str, lang) {
        if (lang && lang in prism.languages) {
          try {
            return prism.highlight(str, prism.languages[lang], lang);
          } catch (__) {}
        }
        return "";
      },
    }),
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
    vite: {
      plugins: [unoCss(unoConfig)],
      resolve: {
        alias: {
          $site: path.resolve("./src/site"),
        },
      },
    },
  },
};

export default config;
