<script lang="ts">
  import Listbox from "./Listbox.svelte";
  export let value: unknown;
</script>

<Listbox {value} on:change={(e) => (value = e.detail)} on:change>
  <slot />
</Listbox>
