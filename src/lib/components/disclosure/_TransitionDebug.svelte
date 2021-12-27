<script lang="ts">
  import { onMount } from "svelte";

  export let name: string;
  export let fn: (arg0: any) => any;
  onMount(() => {
    fn(`Mounting - ${name}`);
    return () => fn(`Unmounting - ${name}`);
  });
</script>

<slot />
