<script lang="ts">
  import NestedDialog from "./_NestedDialog.svelte";
  let open = false;
</script>

<button on:click={() => (open = true)}>Open 1</button>
{#if open}
  <NestedDialog on:close={() => (open = false)} />
{/if}
