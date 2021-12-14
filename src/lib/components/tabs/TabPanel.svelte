<script lang="ts">
  import { onMount } from "svelte";
  import { useTabsContext } from "./TabGroup.svelte";
  import { useId } from "$lib/hooks/use-id";

  let api = useTabsContext("TabPanel");
  let id = `headlessui-tabs-panel-${useId()}`;
  let panelRef = null;

  onMount(() => {
    $api.registerPanel(panelRef);
    return () => $api.unregisterPanel(panelRef);
  });

  $: myIndex = $api.panels.indexOf(panelRef);
  $: selected = myIndex === $api.selectedIndex;

  $: propsWeControl = {
    id,
    role: "tabpanel",
    "aria-labelledby": $api.tabs[myIndex]?.id,
    tabIndex: selected ? 0 : -1,
  };
</script>

<div {...{ ...$$restProps, ...propsWeControl }} bind:this={panelRef}>
  {#if selected}
    <slot />
  {/if}
</div>
