<script lang="ts">
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import { PopoverStates, usePopoverContext } from "./Popover.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render, { Features } from "$lib/utils/Render.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  let api = usePopoverContext("PopoverOverlay");

  let openClosedState = useOpenClosed();

  $: visible =
    openClosedState !== undefined
      ? $openClosedState === State.Open
      : $api.popoverState === PopoverStates.Open;

  function handleClick() {
    $api.closePopover();
  }

  $: slotProps = { open: $api.popoverState === PopoverStates.Open };
</script>

<Render
  {...$$restProps}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"PopoverOverlay"}
  on:click={handleClick}
  aria-hidden
  {visible}
  features={Features.RenderStrategy | Features.Static}
>
  <slot {...slotProps} />
</Render>
