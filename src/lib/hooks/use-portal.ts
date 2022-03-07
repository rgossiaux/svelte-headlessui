import { tick } from "svelte";

export function portal(
  element: HTMLElement,
  target: HTMLElement | null | undefined
) {
  if (target) {
    target.append(element);
    // During initial render, the "portal" might be constructed before
    // the root component has even attached, causing the portal to not work.
    // This is a workaround for this issue--it can't guarantee the portal is
    // **always** last, but it should catch the normal cases.
    tick().then(() => {
      if (target && element !== target.lastChild) {
        target.appendChild(element);
      }
    });
  }
  return {
    update(newTarget: HTMLElement) {
      target = newTarget;
      newTarget.append(element);
    },
    destroy() {
      // Need to detach ourselves--we can't rely on Svelte always detaching
      // us since we moved in the component tree.
      if (target?.contains(element)) {
        target.removeChild(element);
      }
      if (target && target.childNodes.length <= 0) {
        target.parentElement?.removeChild(target);
      }
    },
  };
}
