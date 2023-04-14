<script lang="ts" context="module">
  type TPopoverButtonProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "button"> & {
    disabled?: boolean;
  };
</script>

<script lang="ts">
  import { Keys } from "$lib/utils/keyboard";
  import {
    getFocusableElements,
    Focus,
    focusIn,
  } from "$lib/utils/focus-management";
  import { writable } from "svelte/store";
  import { PopoverStates, usePopoverContext } from "./Popover.svelte";
  import { usePopoverGroupContext } from "./PopoverGroup.svelte";
  import { usePopoverPanelContext } from "./PopoverPanel.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import { resolveButtonType } from "$lib/utils/resolve-button-type";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TPopoverButtonProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "button";
  export let use: HTMLActionArray = [];
  export let disabled: boolean = false;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let api = usePopoverContext("PopoverButton");

  let apiButton = $api.button;
  let ourStore = apiButton;

  let groupContext = usePopoverGroupContext();
  let closeOthers = groupContext?.closeOthers;

  let panelContext = usePopoverPanelContext();
  let isWithinPanel =
    panelContext === null ? false : panelContext === $api.panelId;
  if (isWithinPanel) {
    ourStore = writable();
  }
  let apiPanel = $api.panel;

  // TODO: Revisit when handling Tab/Shift+Tab when using Portal's
  let activeElementRef: Element | null = null;
  let previousActiveElementRef: Element | null =
    typeof window === "undefined" ? null : document.activeElement;

  function handleFocus(event: FocusEvent) {
    if (event.target === window.document.body) {
      // Workaround for a SvelteKit issue: https://github.com/sveltejs/kit/issues/3501
      return;
    }
    previousActiveElementRef = activeElementRef;
    activeElementRef = document.activeElement;
  }

  function handleKeyDown(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    if (isWithinPanel) {
      if ($api.popoverState === PopoverStates.Closed) return;
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault(); // Prevent triggering a *click* event
          event.stopPropagation();
          $api.closePopover();
          $apiButton?.focus(); // Re-focus the original opening Button
          break;
      }
    } else {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault(); // Prevent triggering a *click* event
          event.stopPropagation();
          if ($api.popoverState === PopoverStates.Closed)
            closeOthers?.($api.buttonId);
          $api.togglePopover();
          break;

        case Keys.Escape:
          if ($api.popoverState !== PopoverStates.Open)
            return closeOthers?.($api.buttonId);
          if (!$api.button) return;
          if (!$apiButton?.contains(document.activeElement)) return;
          event.preventDefault();
          event.stopPropagation();
          $api.closePopover();
          break;

        case Keys.Tab:
          if ($api.popoverState !== PopoverStates.Open) return;
          if (!$apiPanel) return;
          if (!$apiButton) return;

          // TODO: Revisit when handling Tab/Shift+Tab when using Portal's
          if (event.shiftKey) {
            // Check if the last focused element exists, and check that it is not inside button or panel itself
            if (!previousActiveElementRef) return;
            if ($apiButton?.contains(previousActiveElementRef)) return;
            if ($apiPanel?.contains(previousActiveElementRef)) return;

            // Check if the last focused element is *after* the button in the DOM
            let focusableElements = getFocusableElements();
            let previousIdx = focusableElements.indexOf(
              previousActiveElementRef as HTMLElement
            );
            let buttonIdx = focusableElements.indexOf($apiButton);
            if (buttonIdx > previousIdx) return;

            event.preventDefault();
            event.stopPropagation();

            focusIn($apiPanel, Focus.Last);
          } else {
            event.preventDefault();
            event.stopPropagation();

            focusIn($apiPanel, Focus.First);
          }

          break;
      }
    }
  }
  function handleKeyUp(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    if (isWithinPanel) return;
    if (event.key === Keys.Space) {
      // Required for firefox, event.preventDefault() in handleKeyDown for
      // the Space key doesn't cancel the handleKeyUp, which in turn
      // triggers a *click*.
      event.preventDefault();
    }
    if ($api.popoverState !== PopoverStates.Open) return;
    if (!$apiPanel) return;
    if (!$apiButton) return;

    // TODO: Revisit when handling Tab/Shift+Tab when using Portal's
    switch (event.key) {
      case Keys.Tab:
        // Check if the last focused element exists, and check that it is not inside button or panel itself
        if (!previousActiveElementRef) return;
        if ($apiButton?.contains(previousActiveElementRef)) return;
        if ($apiPanel?.contains(previousActiveElementRef)) return;

        // Check if the last focused element is *after* the button in the DOM
        let focusableElements = getFocusableElements();
        let previousIdx = focusableElements.indexOf(
          previousActiveElementRef as HTMLElement
        );
        let buttonIdx = focusableElements.indexOf($apiButton);
        if (buttonIdx > previousIdx) return;

        event.preventDefault();
        event.stopPropagation();
        focusIn($apiPanel, Focus.Last);
        break;
    }
  }
  function handleClick() {
    if (disabled) return;
    if (isWithinPanel) {
      $api.closePopover();
      $apiButton?.focus(); // Re-focus the original opening Button
    } else {
      if ($api.popoverState === PopoverStates.Closed)
        closeOthers?.($api.buttonId);
      $apiButton?.focus();
      $api.togglePopover();
    }
  }

  $: type = resolveButtonType({ type: $$props.type, as }, $ourStore);
  $: propsWeControl = isWithinPanel
    ? { type }
    : {
        id: $api.buttonId,
        type,
        "aria-expanded": disabled
          ? undefined
          : $api.popoverState === PopoverStates.Open,
        "aria-controls": $apiPanel ? $api.panelId : undefined,
        disabled: disabled ? true : undefined,
      };

  $: slotProps = {
    open: $api.popoverState === PopoverStates.Open,
  };
</script>

<svelte:window on:focus|capture={handleFocus} />

<Render
  {...$$restProps}
  {...propsWeControl}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"PopoverButton"}
  bind:el={$ourStore}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
>
  <slot {...slotProps} />
</Render>
