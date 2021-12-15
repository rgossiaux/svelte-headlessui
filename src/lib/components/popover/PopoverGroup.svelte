<script lang="ts" context="module">
  export interface PopoverGroupContext {
    registerPopover(registerbag: PopoverRegisterBag): void;
    unregisterPopover(registerbag: PopoverRegisterBag): void;
    isFocusWithinPopoverGroup(): boolean;
    closeOthers(buttonId: string): void;
  }

  const POPOVER_GROUP_CONTEXT_NAME = "PopoverGroupContext";
  export function usePopoverGroupContext(): PopoverGroupContext | undefined {
    return getContext(POPOVER_GROUP_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import type { PopoverRegisterBag } from "./Popover.svelte";
  import { getContext, setContext } from "svelte";
  let groupRef: HTMLDivElement | undefined;
  let popovers: PopoverRegisterBag[] = [];

  function unregisterPopover(registerBag: PopoverRegisterBag) {
    popovers = popovers.filter((bag) => bag != registerBag);
  }

  function registerPopover(registerBag: PopoverRegisterBag) {
    popovers = [...popovers, registerBag];
    return () => {
      unregisterPopover(registerBag);
    };
  }

  function isFocusWithinPopoverGroup() {
    let element = document.activeElement as HTMLElement;

    if (groupRef?.contains(element)) return true;

    // Check if the focus is in one of the button or panel elements. This is important in case you are rendering inside a Portal.
    return popovers.some((bag) => {
      return (
        document.getElementById(bag.buttonId)?.contains(element) ||
        document.getElementById(bag.panelId)?.contains(element)
      );
    });
  }

  function closeOthers(buttonId: string) {
    for (let popover of popovers) {
      if (popover.buttonId !== buttonId) popover.close();
    }
  }

  setContext(POPOVER_GROUP_CONTEXT_NAME, {
    unregisterPopover,
    registerPopover,
    isFocusWithinPopoverGroup,
    closeOthers,
  });
</script>

<div {...$$restProps} bind:this={groupRef}>
  <slot />
</div>
