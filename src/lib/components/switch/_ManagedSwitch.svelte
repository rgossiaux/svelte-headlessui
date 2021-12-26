<script lang="ts">
  import Switch from "./Switch.svelte";

  // This component is only for use in tests
  export let initialChecked = false;
  export let onChange = () => {};
  let state = initialChecked;
</script>

<Switch
  checked={state}
  on:change={(e) => (state = e.detail)}
  on:change={onChange}
>
  <slot />
</Switch>
