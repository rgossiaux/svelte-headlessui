<script lang="ts" context="module">
  export interface DescriptionContext {
    name?: string;
    props?: object;
    register: (value: string) => void;
    descriptionIds?: string;
  }

  const DESCRIPTION_CONTEXT_NAME = "DescriptionContext";
  export function useDescriptionContext():
    | Writable<DescriptionContext>
    | undefined {
    return getContext(DESCRIPTION_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import { getContext, setContext } from "svelte";
  import { writable, Writable } from "svelte/store";
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
