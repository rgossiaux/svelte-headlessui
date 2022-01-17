<script lang="ts" context="module">
  import { getContext, setContext } from "svelte";
  import type { Readable } from "svelte/store";
  import { writable } from "svelte/store";
  const PORTAL_GROUP_CONTEXT_NAME = "headlessui-portal-group-context";

  export function usePortalGroupContext():
    | Readable<HTMLElement | null>
    | undefined {
    return getContext(PORTAL_GROUP_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  export let target: HTMLElement | null;
  let targetStore = writable(target);
  setContext(PORTAL_GROUP_CONTEXT_NAME, targetStore);
  $: targetStore.set(target);
</script>

<slot />
