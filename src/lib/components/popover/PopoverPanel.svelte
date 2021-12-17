<script lang="ts" context="module">
  export type PopoverPanelContext = string | null;

  const POPOVER_PANEL_CONTEXT_NAME = "PopoverPanelContext";
  export function usePopoverPanelContext():
    | StateDefinition["panelId"]
    | undefined {
    return getContext(POPOVER_PANEL_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import { Keys } from "$lib/utils/keyboard";
  import { State } from "$lib/internal/open-closed";
  import {
    getFocusableElements,
    Focus,
    FocusResult,
    focusIn,
  } from "$lib/utils/focus-management";
  import { getContext, setContext, onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import {
    PopoverStates,
    StateDefinition,
    usePopoverContext,
  } from "./Popover.svelte";
  import { ActionArray, useActions } from "$lib/hooks/use-actions";
  export let use: ActionArray = [];
  let panelStore: SvelteStore<HTMLDivElement> = getContext("PopoverPanelRef");
  export let focus = false;

  let api = usePopoverContext("PopoverPanel");
  setContext(POPOVER_PANEL_CONTEXT_NAME, $api.panelId);

  let openClosedState: Writable<State> | undefined = getContext("OpenClosed");

  $: visible =
    openClosedState !== undefined
      ? $openClosedState === State.Open
      : $api.popoverState === PopoverStates.Open;

  onMount(() => {
    if (!focus) return;
    if ($api.popoverState !== PopoverStates.Open) return;
    if (!$api.panel) return;

    let activeElement = document.activeElement as HTMLElement;
    if ($api.panel?.contains(activeElement)) return; // Already focused within Dialog

    focusIn($api.panel!, Focus.First);
  });

  function handleWindowKeydown(event: KeyboardEvent) {
    if ($api.popoverState !== PopoverStates.Open) return;
    if (!$api.panel) return;

    if (event.key !== Keys.Tab) return;
    if (!document.activeElement) return;
    if (!$api.panel?.contains(document.activeElement)) return;

    // We will take-over the default tab behaviour so that we have a bit
    // control over what is focused next. It will behave exactly the same,
    // but it will also "fix" some issues based on whether you are using a
    // Portal or not.
    event.preventDefault();

    let result = focusIn(
      $api.panel!,
      event.shiftKey ? Focus.Previous : Focus.Next
    );

    if (result === FocusResult.Underflow) {
      return $api.button?.focus();
    } else if (result === FocusResult.Overflow) {
      if (!$api.button) return;

      let elements = getFocusableElements();
      let buttonIdx = elements.indexOf($api.button!);

      let nextElements = elements
        .splice(buttonIdx + 1) // Elements after button
        .filter((element) => !$api.panel?.contains(element)); // Ignore items in panel

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

  function handleFocus() {
    if (!focus) return;
    if ($api.popoverState !== PopoverStates.Open) return;
    if (!$api.panel) return;
    if ($api.panel?.contains(document.activeElement as HTMLElement)) return;
    $api.closePopover();
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case Keys.Escape:
        if ($api.popoverState !== PopoverStates.Open) return;
        if (!$api.panel) return;
        if (!$api.panel?.contains(document.activeElement)) return;
        event.preventDefault();
        event.stopPropagation();
        $api.closePopover();
        $api.button?.focus();
        break;
    }
  }
</script>

<svelte:window
  on:keydown={handleWindowKeydown}
  on:focus|capture={handleFocus}
/>
{#if visible}
  <div
    use:useActions={use}
    {...$$restProps}
    on:keydown={handleKeydown}
    bind:this={$panelStore}
  >
    <slot open={$api.popoverState === PopoverStates.Open} close={$api.close} />
  </div>
{/if}
