<script lang="ts" context="module">
  type TDialogOverlayProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {};
</script>

<script lang="ts">
  import { DialogStates, useDialogContext } from "./Dialog.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TDialogOverlayProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/

  let api = useDialogContext("DialogOverlay");
  let id = `headlessui-dialog-overlay-${useId()}`;

  function handleClick(e: CustomEvent) {
    let event = e as any as MouseEvent;
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    $api.close();
  }

  $: propsWeControl = {
    id,
    "aria-hidden": true,
  };

  $: slotProps = { open: $api.dialogState === DialogStates.Open };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"DialogOverlay"}
  on:click={handleClick}
>
  <slot {...slotProps} />
</Render>
