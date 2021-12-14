<script lang="ts">
  import { Keys } from "$lib/utils/keyboard";
  import {
    focusElement,
    focusIn,
    Focus,
    FocusResult,
  } from "$lib/utils/focus-management";
  import { contains } from "$lib/internal/dom-containers";
  import { afterUpdate, onMount, onDestroy } from "svelte";

  export let containers: Set<HTMLElement>;
  export let enabled: boolean = true;
  export let options: { initialFocus?: HTMLElement | null } = {};

  let restoreElement: HTMLElement | null =
    typeof window !== "undefined"
      ? (document.activeElement as HTMLElement)
      : null;

  let previousActiveElement: HTMLElement | null = null;

  function handleFocus() {
    if (!enabled) return;
    if (containers.size !== 1) return;
    let { initialFocus } = options;

    let activeElement = document.activeElement as HTMLElement;

    if (initialFocus) {
      if (initialFocus === activeElement) {
        return; // Initial focus ref is already the active element
      }
    } else if (contains(containers, activeElement)) {
      return; // Already focused within Dialog
    }

    restoreElement = activeElement;

    // Try to focus the initialFocus ref
    if (initialFocus) {
      focusElement(initialFocus);
    } else {
      let couldFocus = false;
      for (let container of containers) {
        let result = focusIn(container, Focus.First);
        if (result === FocusResult.Success) {
          couldFocus = true;
          break;
        }
      }

      if (!couldFocus)
        console.warn(
          "There are no focusable elements inside the <FocusTrap />"
        );
    }

    previousActiveElement = document.activeElement as HTMLElement;
  }

  // Restore when `enabled` becomes false
  function restore() {
    focusElement(restoreElement);
    restoreElement = null;
    previousActiveElement = null;
  }

  // Handle initial focus
  onMount(handleFocus);

  afterUpdate(() => (enabled ? handleFocus() : restore()));

  onDestroy(restore);

  // Handle Tab & Shift+Tab keyboard events
  function handleWindowKeyDown(event: KeyboardEvent) {
    if (!enabled) return;
    if (event.key !== Keys.Tab) return;
    if (!document.activeElement) return;
    if (containers.size !== 1) return;

    event.preventDefault();

    for (let element of containers) {
      let result = focusIn(
        element,
        (event.shiftKey ? Focus.Previous : Focus.Next) | Focus.WrapAround
      );

      if (result === FocusResult.Success) {
        previousActiveElement = document.activeElement as HTMLElement;
        break;
      }
    }
  }

  // Prevent programmatically escaping
  function handleWindowFocus(event: FocusEvent) {
    if (!enabled) return;
    if (containers.size !== 1) return;

    let previous = previousActiveElement;
    if (!previous) return;

    let toElement = event.target as HTMLElement | null;

    if (toElement && toElement instanceof HTMLElement) {
      if (!contains(containers, toElement)) {
        event.preventDefault();
        event.stopPropagation();
        focusElement(previous);
      } else {
        previousActiveElement = toElement;
        focusElement(toElement);
      }
    } else {
      focusElement(previousActiveElement);
    }
  }
</script>

<svelte:window
  on:keydown={handleWindowKeyDown}
  on:focus|capture={handleWindowFocus}
/>
