<script lang="ts">
  import { useId } from "$lib/hooks/use-id";
  import { getContext, onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import type { LabelContext } from "./LabelProvider.svelte";
  const id = `headlessui-label-${useId()}`;
  export let passive = false;
  let contextStore: Writable<LabelContext> | undefined = getContext(
    "headlessui-label-context"
  );
  if (!contextStore) {
    throw new Error(
      "You used a <Label /> component, but it is not inside a relevant parent."
    );
  }

  onMount(() => $contextStore.register(id));

  let allProps = { ...$$restProps, ...$contextStore.props, id };
  if (passive) delete allProps["onClick"];
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label
  {...allProps}
  on:blur
  on:click
  on:focus
  on:keyup
  on:keydown
  on:keypress
  on:click={(event) => {
    if (!passive) allProps["onClick"]?.(event);
  }}
>
  <slot />
</label>
