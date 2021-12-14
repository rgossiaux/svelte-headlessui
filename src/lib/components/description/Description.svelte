<script lang="ts">
  import { useId } from "$lib/hooks/use-id";
  import { getContext, onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import type { DescriptionContext } from "./DescriptionProvider.svelte";
  const id = `headlessui-description-${useId()}`;
  let contextStore: Writable<DescriptionContext> | undefined = getContext(
    "headlessui-description-context"
  );
  if (!contextStore) {
    throw new Error(
      "You used a <Description /> component, but it is not inside a relevant parent."
    );
  }

  onMount(() => $contextStore.register(id));
</script>

<p {...$$restProps} {...$contextStore?.props} {id}>
  <slot />
</p>
