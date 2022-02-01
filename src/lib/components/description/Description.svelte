<script lang="ts">
  import type { HTMLActionArray } from "$lib/hooks/use-actions";

  import { useId } from "$lib/hooks/use-id";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import Render from "$lib/utils/Render.svelte";
  import { onMount } from "svelte";
  import { get_current_component } from "svelte/internal";
  import { useDescriptionContext } from "./DescriptionProvider.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component());
  export let as: SupportedAs = "p";
  export let use: HTMLActionArray = [];

  const id = `headlessui-description-${useId()}`;
  let contextStore = useDescriptionContext();
  if (!contextStore) {
    throw new Error(
      "You used a <Description /> component, but it is not inside a relevant parent."
    );
  }

  onMount(() => $contextStore?.register(id));

  $: slotProps = $contextStore!.slotProps || {};
</script>

<Render
  name={"Description"}
  {...$$restProps}
  {as}
  {slotProps}
  {...$contextStore?.props}
  {id}
  use={[...use, forwardEvents]}
>
  <slot {...slotProps} />
</Render>
