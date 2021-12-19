<script lang="ts">
  import { ListboxStates, useListboxContext } from "./Listbox.svelte";
  import { useId } from "$lib/hooks/use-id";
  let id = `headlessui-listbox-label-${useId()}`;
  let api = useListboxContext("ListboxLabel");

  let labelRef = $api.labelRef;
  let buttonRef = $api.buttonRef;

  function handleClick(): void {
    $buttonRef?.focus({ preventScroll: true });
  }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label {...$$restProps} {id} bind:this={$labelRef} on:click={handleClick}>
  <slot
    open={$api.listboxState === ListboxStates.Open}
    disabled={$api.disabled}
  />
</label>
