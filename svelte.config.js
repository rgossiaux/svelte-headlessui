import path from 'path';
import adapter from "@sveltejs/adapter-vercel";
import preprocess from "svelte-preprocess";
import {mdsvex} from 'mdsvex';
import slug from 'rehype-slug';
import Prism from 'prismjs';
import 'prism-svelte';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [
    preprocess({
      postcss: true,
    }),
    mdsvex({
      extensions: ['.md'],
      rehypePlugins: [slug],
      highlight: function (str, lang) {
        if (lang && lang in Prism.languages) {
          try {
            return Prism.highlight(str, Prism.languages[lang], lang);
          } catch(__) {}
        }
        return '';
      }
    })
  ],
  kit: {
    adapter: adapter(),
    package: {
      exports: (filepath) => filepath.endsWith("index.js"),
      files: (filepath) => !filepath.endsWith('.text.js')
    },
    target: "#svelte",
    vite: {
      resolve: {
        alias: {
          '$site': path.resolve('./src/site')
        }
      }
    }
  },
};

export default config;
