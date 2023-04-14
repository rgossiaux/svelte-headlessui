<script lang="ts" context="module">
  type TPopoverOverlayProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {};
</script>

<script lang="ts">
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import { PopoverStates, usePopoverContext } from "./Popover.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Features, type TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TPopoverOverlayProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let api = usePopoverContext("PopoverOverlay");
  let id = `headlessui-popover-overlay-${useId()}`;

  let openClosedState = useOpenClosed();

  $: visible =
    openClosedState !== undefined
      ? $openClosedState === State.Open
      : $api.popoverState === PopoverStates.Open;

  function handleClick() {
    $api.closePopover();
  }

  $: slotProps = { open: $api.popoverState === PopoverStates.Open };

  $: propsWeControl = { id };
</script>

<Render
  {...$$restProps}
  {...propsWeControl}
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
