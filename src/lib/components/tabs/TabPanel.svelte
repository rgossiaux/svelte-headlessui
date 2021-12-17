<script lang="ts">
  import { onMount } from "svelte";
  import { useTabsContext } from "./TabGroup.svelte";
  import { useId } from "$lib/hooks/use-id";

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

{#if selected}
  <div {...{ ...$$restProps, ...propsWeControl }}>
    <slot />
  </div>
{/if}
