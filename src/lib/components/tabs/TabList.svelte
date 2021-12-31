<script lang="ts">
  import { useTabsContext } from "./TabGroup.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  let api = useTabsContext("TabList");
  let listRef = $api.listRef;

  $: propsWeControl = {
    role: "tablist",
    "aria-orientation": $api.orientation,
  };

  $: slotProps = { selectedIndex: $api.selectedIndex };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  bind:el={$listRef}
  use={[...use, forwardEvents]}
  name={"TabList"}
>
  <slot {...slotProps} />
</Render>
