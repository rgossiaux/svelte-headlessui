import {
  presetUno,
  presetAttributify,
  presetWebFonts,
  presetIcons,
  extractorSvelte,
} from "unocss";
import { presetTypography } from "unocss-preset-typography";

export default {
  presets: [
    presetAttributify(),
    presetUno(),
    presetIcons(),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: ["Inter"],
        mono: ["Space Mono"],
      },
    }),
    presetTypography(),
  ],
  extractors: [extractorSvelte],
  theme: {
    transitionProperty: {
      "opacity-transform": "opacity,transform",
    },
    colors: {
      svelte: {
        light: "#ff6432",
        DEFAULT: "#ff3e00",
        dark: "#cc3100",
      },
    },
  },
  rules: [
    // your custom rules
  ],
  shortcuts: [
    // shortcuts to multiple utilities
  ],
};
