<script lang="ts">
  import { ActionArray, useActions } from "$lib/hooks/use-actions";

  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import { PopoverStates, usePopoverContext } from "./Popover.svelte";
  export let use: ActionArray = [];

  let api = usePopoverContext("PopoverOverlay");

  let openClosedState = useOpenClosed();

  $: visible =
    openClosedState !== undefined
      ? $openClosedState === State.Open
      : $api.popoverState === PopoverStates.Open;

  function handleClick() {
    $api.closePopover();
  }
</script>

{#if visible}
  <div use:useActions={use} {...$$restProps} on:click={handleClick} aria-hidden>
    <slot open={$api.popoverState === PopoverStates.Open} />
  </div>
{/if}
