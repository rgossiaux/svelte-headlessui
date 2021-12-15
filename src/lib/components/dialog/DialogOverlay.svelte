<script lang="ts">
  import { DialogStates, useDialogContext } from "./Dialog.svelte";
  import { useId } from "$lib/hooks/use-id";
  let api = useDialogContext("DialogOverlay");
  let id = `headlessui-dialog-overlay-${useId()}`;
  function handleClick(event: MouseEvent) {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    $api?.close();
  }
  $: propsWeControl = {
    id,
    "aria-hidden": true,
  };
</script>

<div {...{ ...$$restProps, ...propsWeControl }} on:click={handleClick}>
  <slot open={$api?.dialogState === DialogStates.Open} />
</div>
