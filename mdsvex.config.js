import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { escapeSvelte } from "mdsvex";
import { lex, parse } from "fenceparser";
import { renderCodeToHTML, runTwoSlash, createShikiHighlighter } from "shiki-twoslash";

const config = {
  extensions: [".svelte.md", ".md", ".svx"],

  highlight: {
    async highlighter(code, lang, meta) {
      // Adapted from the `remark-shiki-twoslash` repo
      // See: https://github.com/shikijs/twoslash/blob/fbf061261fcda90c46e946ce1e2e9357d465c145/packages/remark-shiki-twoslash/src/index.ts#L172-L215
      let fence;

      try {
        fence = parse(lex([lang, meta].filter(Boolean).join(" ")));
      } catch (error) {
        throw new Error(`Could not parse the codefence for this code sample \n${code}`);
      }

      let twoslash;
      if (fence.twoslash === true) {
        twoslash = runTwoSlash(code, lang);
      }

      const highlighter = await createShikiHighlighter({ theme: "github-dark" });
      const html = escapeSvelte(renderCodeToHTML(code, lang, fence, {}, highlighter, twoslash));
      return `{@html \`${html}\` }`;
    },
  },

  remarkPlugins: [],
  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
};

export default config;
