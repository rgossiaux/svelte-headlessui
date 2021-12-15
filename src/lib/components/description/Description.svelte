<script lang="ts">
  import { useId } from "$lib/hooks/use-id";
  import { onMount } from "svelte";
  import { useDescriptionContext } from "./DescriptionProvider.svelte";
  const id = `headlessui-description-${useId()}`;
  let contextStore = useDescriptionContext();
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
