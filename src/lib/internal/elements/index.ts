import { SvelteComponent } from "svelte/internal";

// We can't use svelte.JSX.IntrinsicElements like in React, since
// svelte.JSX.IntrinsicElements allows any string as the key
export type SupportedElement = (keyof HTMLElementTagNameMap)
export type SupportedAs = SupportedElement | typeof SvelteComponent;

export function isValidElement(element: SupportedAs): boolean {
  if (!element) return false
  if (typeof element === 'string') return true  // Is a HTML element
  if (element.prototype instanceof SvelteComponent) return true  // Is a Svelte component
  return false
}
