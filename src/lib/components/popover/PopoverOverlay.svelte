<script lang="ts">
  import { State } from "$lib/internal/open-closed";
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { PopoverStates, usePopoverContext } from "./Popover.svelte";

  let api = usePopoverContext("PopoverOverlay");

  let openClosedState: Writable<State> | undefined = getContext("OpenClosed");

  $: visible =
    openClosedState !== undefined
      ? $openClosedState === State.Open
      : $api.popoverState === PopoverStates.Open;

  function handleClick() {
    $api.closePopover();
  }
</script>

{#if visible}
  <div {...$$restProps} on:click={handleClick} aria-hidden>
    <slot open={$api.popoverState === PopoverStates.Open} />
  </div>
{/if}
