<script lang="ts">
  import { useId } from "$lib/hooks/use-id";
  import { onMount } from "svelte";
  import { useLabelContext } from "./LabelProvider.svelte";
  const id = `headlessui-label-${useId()}`;
  export let passive = false;
  let contextStore = useLabelContext();
  if (!contextStore) {
    throw new Error(
      "You used a <Label /> component, but it is not inside a relevant parent."
    );
  }

  onMount(() => $contextStore!.register(id));

  let allProps = { ...$$restProps, ...$contextStore!.props, id } as any;
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
