<script lang="ts" context="module">
  type TTabPanelsProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp> & {};
</script>

<script lang="ts">
  import { useTabsContext } from "./TabGroup.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render, { type TPassThroughProps } from "$lib/utils/Render.svelte";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TTabPanelsProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let api = useTabsContext("TabPanels");
  $: slotProps = { selectedIndex: $api.selectedIndex };
</script>

<Render
  {...$$restProps}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"TabPanels"}
>
  <slot {...slotProps} />
</Render>
