<script lang="ts">
  import { DialogStates, useDialogContext } from "./Dialog.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { onMount } from "svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component());
  export let as: SupportedAs = "h2";
  export let use: HTMLActionArray = [];

  let api = useDialogContext("DialogTitle");
  let id = `headlessui-dialog-title-${useId()}`;

  onMount(() => {
    $api.setTitleId(id);
    return () => $api.setTitleId(undefined);
  });
  $: propsWeControl = {
    id,
  };

  $: slotProps = { open: $api.dialogState === DialogStates.Open };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"DialogTitle"}
>
  <slot {...slotProps} />
</Render>
