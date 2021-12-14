<script lang="ts">
  import Dialog from "$lib/components/dialog/Dialog.svelte";
  import DialogOverlay from "$lib/components/dialog/DialogOverlay.svelte";

  let showChild = false;
  export let level = 0;
</script>

<Dialog open={true} on:close class="fixed z-10 inset-0">
  <DialogOverlay class="fixed inset-0 bg-gray-500 opacity-25" />
  <div
    class="z-10 fixed left-12 top-24 bg-white w-96 p-4 transform"
    style={`transform: translate(calc(50px * ${level}), calc(50px * ${level}))`}
  >
    <p>Level: {level}</p>
    <div class="space-x-4">
      <button
        class="bg-gray-200 px-2 py-1 rounded"
        on:click={() => (showChild = true)}
      >
        Open (1)
      </button>
      <button
        class="bg-gray-200 px-2 py-1 rounded"
        on:click={() => (showChild = true)}
      >
        Open (2)
      </button>
      <button
        class="bg-gray-200 px-2 py-1 rounded"
        on:click={() => (showChild = true)}
      >
        Open (3)
      </button>
    </div>
  </div>
  {#if showChild}
    <svelte:self on:close={() => (showChild = false)} level={level + 1} />
  {/if}
</Dialog>
