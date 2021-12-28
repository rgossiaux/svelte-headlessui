export function portal(
  element: HTMLElement,
  target: HTMLElement | null | undefined
) {
  if (target) {
    target.append(element);
  }
  return {
    update(newTarget: HTMLElement) {
      target = newTarget;
      newTarget.append(element);
    },
    destroy() {
      if (target && target.childNodes.length <= 0) {
        target.parentElement?.removeChild(target);
      }
    },
  };
}
