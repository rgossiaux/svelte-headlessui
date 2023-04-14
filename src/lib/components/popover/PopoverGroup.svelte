<script lang="ts" context="module">
  export interface PopoverGroupContext {
    registerPopover(registerbag: PopoverRegisterBag): void;
    unregisterPopover(registerbag: PopoverRegisterBag): void;
    isFocusWithinPopoverGroup(): boolean;
    closeOthers(buttonId: string): void;
  }

  const POPOVER_GROUP_CONTEXT_NAME = "headlessui-popover-group-context";
  export function usePopoverGroupContext(): PopoverGroupContext | undefined {
    return getContext(POPOVER_GROUP_CONTEXT_NAME);
  }

  type TPopoverGroupProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {};
</script>

<script lang="ts">
  import type { PopoverRegisterBag } from "./Popover.svelte";
  import { getContext, setContext } from "svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TPopoverGroupProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
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

  $: slotProps = {};
</script>

<Render
  {...$$restProps}
  {as}
  use={[...use, forwardEvents]}
  {slotProps}
  name={"PopoverGroup"}
  bind:el={groupRef}
>
  <slot {...slotProps} />
</Render>
