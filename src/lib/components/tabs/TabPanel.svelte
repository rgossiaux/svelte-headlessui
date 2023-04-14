<script lang="ts" context="module">
  type TTabPanelProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {};
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { useTabsContext } from "./TabGroup.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import { writable } from "svelte/store";
  import { Features, type TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TTabPanelProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let elementRef = writable<HTMLElement | null>(null);
  let api = useTabsContext("TabPanel");
  let id = `headlessui-tabs-panel-${useId()}`;

  $: panelData = { id, ref: elementRef };

  onMount(() => {
    $api.registerPanel(panelData);
    return () => $api.unregisterPanel(panelData);
  });

  $: myIndex = $api.panels.indexOf(panelData);
  $: selected = myIndex === $api.selectedIndex;

  $: propsWeControl = {
    id,
    role: "tabpanel",
    "aria-labelledby": $api.tabs[myIndex]?.id,
    tabIndex: selected ? 0 : -1,
  };

  $: if (process.env.NODE_ENV === "test") {
    Object.assign(propsWeControl, { ["data-headlessui-index"]: myIndex });
  }

  $: slotProps = { selected };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  use={[...use, forwardEvents]}
  name={"TabPanel"}
  {slotProps}
  bind:el={$elementRef}
  visible={selected}
  features={Features.RenderStrategy | Features.Static}
>
  <slot {...slotProps} />
</Render>
