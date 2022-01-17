<script lang="ts" context="module">
  import { getContext, setContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";
  const FORCE_PORTAL_ROOT_CONTEXT_NAME = "headlessui-force-portal-root-context";

  export function usePortalRoot(): Writable<boolean> | undefined {
    return getContext(FORCE_PORTAL_ROOT_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  export let force: boolean;
  setContext(FORCE_PORTAL_ROOT_CONTEXT_NAME, writable(force));
</script>

<slot />
