<script lang="ts">
  import { DialogStates, useDialogContext } from "./Dialog.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { onMount } from "svelte";
  let api = useDialogContext("DialogTitle");
  let id = `headlessui-dialog-title-${useId()}`;

  onMount(() => {
    $api.setTitleId(id);
    return () => $api.setTitleId(null);
  });
  $: propsWeControl = {
    id,
  };
</script>

<h2 {...{ ...$$restProps, ...propsWeControl }}>
  <slot open={$api.dialogState === DialogStates.Open} />
</h2>
