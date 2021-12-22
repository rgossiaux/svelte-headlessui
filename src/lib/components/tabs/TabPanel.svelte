<script lang="ts">
  import { onMount } from "svelte";
  import { useTabsContext } from "./TabGroup.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render, { Features } from "$lib/utils/Render.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  let api = useTabsContext("TabPanel");
  let id = `headlessui-tabs-panel-${useId()}`;

  onMount(() => {
    $api.registerPanel(id);
    return () => $api.unregisterPanel(id);
  });

  $: myIndex = $api.panels.indexOf(id);
  $: selected = myIndex === $api.selectedIndex;

  $: propsWeControl = {
    id,
    role: "tabpanel",
    "aria-labelledby": $api.tabs[myIndex]?.id,
    tabIndex: selected ? 0 : -1,
  };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  use={[...use, forwardEvents]}
  name={"TabPanel"}
  visible={selected}
  features={Features.RenderStrategy | Features.Static}
>
  <slot />
</Render>
