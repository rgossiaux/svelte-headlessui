import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const config = {
  extensions: [".svelte.md", ".md", ".svx"],

  remarkPlugins: [],
  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
};

export default config;
