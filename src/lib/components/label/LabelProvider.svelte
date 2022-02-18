<script lang="ts" context="module">
  export interface LabelContext {
    name?: string;
    slotProps?: object;
    props?: object;
    register: (value: string) => void;
    labelIds?: string;
  }

  const LABEL_CONTEXT_NAME = "headlessui-label-context";
  export function useLabelContext(): Writable<LabelContext> | undefined {
    return getContext(LABEL_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import { getContext, setContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";
  export let name: string;
  export let slotProps = {};
  let labelIds: string[] = [];
  let contextStore = writable<LabelContext>({
    name,
    slotProps,
    props: $$restProps,
    register,
  });
  setContext(LABEL_CONTEXT_NAME, contextStore);

  $: contextStore.set({
    name,
    slotProps,
    props: $$restProps,
    register,
    labelIds: labelIds.length > 0 ? labelIds.join(" ") : undefined,
  });

  function register(value: string) {
    labelIds = [...labelIds, value];
    return () => {
      labelIds = labelIds.filter((labelId) => labelId !== value);
    };
  }
</script>

<slot labelledby={$contextStore.labelIds} />
