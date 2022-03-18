<script lang="ts" context="module">
  export type PopoverPanelContext = string | null;

  const POPOVER_PANEL_CONTEXT_NAME = "headlessui-popover-panel-context";
  export function usePopoverPanelContext():
    | StateDefinition["panelId"]
    | undefined {
    return getContext(POPOVER_PANEL_CONTEXT_NAME);
  }

  type TPopoverPanelProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {
    /**
     * Whether the `PopoverPanel` should trap focus.
     * If true, focus will move inside the `PopoverPanel` when it is opened,
     * and if focus leaves the `PopoverPanel` it will close.
     */
    focus?: boolean;
    /** Whether the element should ignore the internally managed open/closed state */
    static?: boolean;
    /** Whether the element should be unmounted, instead of just hidden, based on the open/closed state	*/
    unmount?: boolean;
  };
</script>

<script lang="ts">
  import { Keys } from "$lib/utils/keyboard";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import {
    getFocusableElements,
    Focus,
    FocusResult,
    focusIn,
  } from "$lib/utils/focus-management";
  import { getContext, setContext } from "svelte";
  import type { StateDefinition } from "./Popover.svelte";
  import { PopoverStates, usePopoverContext } from "./Popover.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import { Features, type TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TPopoverPanelProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];
  export let focus = false;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let api = usePopoverContext("PopoverPanel");
  setContext(POPOVER_PANEL_CONTEXT_NAME, $api.panelId);

  let panelStore = $api.panel;
  let apiButton = $api.button;

  let openClosedState = useOpenClosed();

  $: visible =
    openClosedState !== undefined
      ? $openClosedState === State.Open
      : $api.popoverState === PopoverStates.Open;

  $: (() => {
    if (!focus) return;
    if ($api.popoverState !== PopoverStates.Open) return;
    if (!$panelStore) return;

    let activeElement = document.activeElement as HTMLElement;
    if ($panelStore.contains(activeElement)) return; // Already focused within Dialog

    focusIn($panelStore, Focus.First);
  })();

  function handleWindowKeydown(event: KeyboardEvent) {
    if ($api.popoverState !== PopoverStates.Open) return;
    if (!$panelStore) return;

    if (event.key !== Keys.Tab) return;
    if (!document.activeElement) return;
    if (!$panelStore?.contains(document.activeElement)) return;

    // We will take-over the default tab behaviour so that we have a bit
    // control over what is focused next. It will behave exactly the same,
    // but it will also "fix" some issues based on whether you are using a
    // Portal or not.
    event.preventDefault();

    let result = focusIn(
      $panelStore,
      event.shiftKey ? Focus.Previous : Focus.Next
    );

    if (result === FocusResult.Underflow) {
      return $apiButton?.focus();
    } else if (result === FocusResult.Overflow) {
      if (!$apiButton) return;

      let elements = getFocusableElements();
      let buttonIdx = elements.indexOf($apiButton!);

      let nextElements = elements
        .splice(buttonIdx + 1) // Elements after button
        .filter((element) => !$panelStore?.contains(element)); // Ignore items in panel

      // Try to focus the next element, however it could fail if we are in a
      // Portal that happens to be the very last one in the DOM. In that
      // case we would Error (because nothing after the button is
      // focusable). Therefore we will try and focus the very first item in
      // the document.body.
      if (focusIn(nextElements, Focus.First) === FocusResult.Error) {
        focusIn(document.body, Focus.First);
      }
    }
  }

  function handleFocus(event: FocusEvent) {
    if (event.target === window.document.body) {
      // Workaround for a SvelteKit issue: https://github.com/sveltejs/kit/issues/3501
      return;
    }
    if (!focus) return;
    if ($api.popoverState !== PopoverStates.Open) return;
    if (!$panelStore) return;
    if ($panelStore.contains(document.activeElement as HTMLElement)) return;
    $api.closePopover();
  }

  function handleKeydown(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    switch (event.key) {
      case Keys.Escape:
        if ($api.popoverState !== PopoverStates.Open) return;
        if (!$panelStore) return;
        if (!$panelStore.contains(document.activeElement)) return;
        event.preventDefault();
        event.stopPropagation();
        $api.closePopover();
        $apiButton?.focus();
        break;
    }
  }

  $: slotProps = {
    open: $api.popoverState === PopoverStates.Open,
    close: $api.close,
  };
</script>

<svelte:window
  on:keydown={handleWindowKeydown}
  on:focus|capture={handleFocus}
/>
<Render
  {...$$restProps}
  id={$api.panelId}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"PopoverPanel"}
  bind:el={$panelStore}
  on:keydown={handleKeydown}
  {visible}
  features={Features.RenderStrategy | Features.Static}
>
  <slot {...slotProps} />
</Render>
