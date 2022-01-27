import rehypeSlug from "rehype-slug";

const config = {
  extensions: [".svelte.md", ".md", ".svx"],

  remarkPlugins: [],
  rehypePlugins: [rehypeSlug],
};

export default config;
