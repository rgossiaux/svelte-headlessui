<script lang="ts">
  import Dialog from "./Dialog.svelte";

  // This component is only for use in tests
  export let initialOpen = false;
  export let onClose = () => {};
  export let buttonInside = false;
  export let buttonText: string | null = null;
  export let buttonProps = {};
  let state = initialOpen;
</script>

{#if buttonText !== null && !buttonInside}
  <button {...buttonProps} on:click={() => (state = !state)}
    >{buttonText}</button
  >
{/if}
<Dialog
  {...$$restProps}
  open={state}
  on:close={(e) => (state = e.detail)}
  on:close={onClose}
>
  {#if buttonText !== null && buttonInside}
    <button {...buttonProps} on:click={() => (state = !state)}
      >{buttonText}</button
    >
  {/if}
  <slot />
</Dialog>
