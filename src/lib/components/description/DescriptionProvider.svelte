<script lang="ts" context="module">
  export interface DescriptionContext {
    name?: string;
    props?: object;
    register: (value: string) => void;
    descriptionIds?: string;
  }
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import { writable, Writable } from "svelte/store";
  export let name: string;
  let descriptionIds = [];
  let contextStore: Writable<DescriptionContext> = writable({
    name,
    register,
    props: $$restProps,
  });
  setContext("headlessui-description-context", contextStore);

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
