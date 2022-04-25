import { SvelteComponent } from "svelte/internal";

type HTMLElement = (keyof HTMLElementTagNameMap)
export type SupportedAs = HTMLElement | typeof SvelteComponent;

export function isValidElement(element: SupportedAs): boolean {
  if (!element) return false
  if (typeof element === 'string') return true  // Is a HTML element
  if (element.prototype instanceof SvelteComponent) return true  // Is a Svelte component
  return false
}
