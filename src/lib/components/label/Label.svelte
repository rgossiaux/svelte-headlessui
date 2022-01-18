<script lang="ts">
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import { useId } from "$lib/hooks/use-id";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { onMount } from "svelte";
  import { get_current_component } from "svelte/internal";
  import { useLabelContext } from "./LabelProvider.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component());
  export let as: SupportedAs = "label";
  export let use: HTMLActionArray = [];

  const id = `headlessui-label-${useId()}`;
  export let passive = false;
  let contextStore = useLabelContext();
  if (!contextStore) {
    throw new Error(
      "You used a <Label /> component, but it is not inside a relevant parent."
    );
  }

  onMount(() => $contextStore!.register(id));

  let allProps: any = {};
  $: allProps = { ...$$restProps, ...$contextStore!.props, id };
  if (passive) delete allProps["onClick"];
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<Render
  {...allProps}
  name={"Label"}
  {as}
  use={[...use, forwardEvents]}
  on:click={(event) => {
    if (!passive) allProps["onClick"]?.(event);
  }}
>
  <slot />
</Render>
