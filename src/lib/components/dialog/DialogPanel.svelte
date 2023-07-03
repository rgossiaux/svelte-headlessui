<script context="module">"use strict";
</script>

<script>import { DialogStates, useDialogContext } from "./Dialog.svelte";
import { useId } from "../../hooks/use-id";
import { forwardEventsBuilder } from "../../internal/forwardEventsBuilder";
import { get_current_component } from "svelte/internal";
import Render from "../../utils/Render.svelte";
export let as = "div";
export let use = [];
/***** Events *****/
const forwardEvents = forwardEventsBuilder(get_current_component());
/***** Component *****/
let api = useDialogContext("DialogPanel");
let id = `headlessui-dialog-panel-${useId()}`;
function handleClick(e) {
    let event = e;
    if (event.target !== event.currentTarget)
        return;
    event.preventDefault();
    event.stopPropagation();
    $api.close();
}
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
  name={"DialogPanel"}
  on:click={handleClick}
>
  <slot {...slotProps} />
</Render>
