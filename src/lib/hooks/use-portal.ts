export function portal(element: HTMLElement, target: HTMLElement) {
  target.append(element);
  return {
    update(newTarget: HTMLElement) {
      target = newTarget;
      newTarget.append(element);
    },
    destroy() {
      if (target.childNodes.length <= 0) {
        target.parentElement?.removeChild(target);
      }
    },
  };
}
