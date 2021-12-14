<script lang="ts">
  import { useTabsContext } from "./TabGroup.svelte";

  let api = useTabsContext("TabList");
  $: propsWeControl = {
    role: "tablist",
    "aria-orientation": $api.orientation,
  };
</script>

<div {...{ ...$$restProps, ...propsWeControl }}>
  <slot selectedIndex={$api.selectedIndex} />
</div>
