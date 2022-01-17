<script lang="ts" context="module">
  export interface DescriptionContext {
    name?: string;
    props?: { slotProps?: object };
    register: (value: string) => void;
    descriptionIds?: string;
  }

  const DESCRIPTION_CONTEXT_NAME = "headlessui-description-context";
  export function useDescriptionContext():
    | Readable<DescriptionContext>
    | undefined {
    return getContext(DESCRIPTION_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import { getContext, setContext } from "svelte";
  import type { Readable, Writable } from "svelte/store";
  import { writable } from "svelte/store";
  export let name: string;
  let descriptionIds: string[] = [];
  let contextStore: Writable<DescriptionContext> = writable({
    name,
    register,
    props: $$restProps,
  });
  setContext(DESCRIPTION_CONTEXT_NAME, contextStore);

  $: contextStore.set({
    name,
    props: $$restProps,
    register,
    descriptionIds:
      descriptionIds.length > 0 ? descriptionIds.join(" ") : undefined,
  });

  function register(value: string) {
    descriptionIds = [...descriptionIds, value];
    return () => {
      descriptionIds = descriptionIds.filter(
        (descriptionId) => descriptionId !== value
      );
    };
  }
</script>

<slot describedby={$contextStore.descriptionIds} />
