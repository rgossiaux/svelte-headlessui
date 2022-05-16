import type { SupportedAs } from "$lib/internal/elements";
export function resolveButtonType(
  props: { type?: string; as?: SupportedAs },
  ref: HTMLElement | null | undefined
): string | undefined {
  if (props.type) return props.type;
  let tag = props.as ?? "button";
  if (typeof tag === "string" && tag.toLowerCase() === "button")
    return "button";
  if (ref && ref instanceof HTMLButtonElement) return "button";
  return undefined;
}
