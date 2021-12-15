<script lang="ts" context="module">
  export interface LabelContext {
    name?: string;
    props?: object;
    register: (value: string) => void;
    labelIds?: string;
  }

  const LABEL_CONTEXT_NAME = "LabelContext";
  export function useLabelContext(): Writable<LabelContext> | undefined {
    return getContext(LABEL_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import { getContext, setContext } from "svelte";
  import { writable, Writable } from "svelte/store";
  export let name: string;
  let labelIds = [];
  let contextStore: Writable<LabelContext> = writable({
    name,
    register,
    props: $$restProps,
  });
  setContext(LABEL_CONTEXT_NAME, contextStore);

  $: contextStore.set({
    name,
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
