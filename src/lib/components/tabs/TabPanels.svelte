<script lang="ts">
  import { useTabsContext } from "./TabGroup.svelte";

  let api = useTabsContext("TabPanels");
</script>

<div {...$$restProps}>
  <slot selectedIndex={$api.selectedIndex} />
</div>
