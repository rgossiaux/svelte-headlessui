<script lang="ts">
  import RadioGroup from "./RadioGroup.svelte";
  export let value: unknown;
</script>

<RadioGroup {value} on:change={(e) => (value = e.detail)} on:change>
  <slot />
</RadioGroup>
