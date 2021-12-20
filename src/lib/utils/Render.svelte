<script lang="ts" context="module">
  import {
    getElementComponent,
    SupportedElement,
  } from "$lib/internal/elements";
  import { get_current_component, SvelteComponent } from "svelte/internal";

  export enum RenderStrategy {
    Unmount,
    Hidden,
  }
</script>

<script lang="ts">
  import type { ActionArray } from "$lib/hooks/use-actions";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";

  export let name: string;
  export let as: SvelteComponent | SupportedElement;
  export let el: HTMLElement | null = null;
  export let use: ActionArray = [];
  export let slot: unknown = {};
  const forwardEvents = forwardEventsBuilder(get_current_component());

  if (!as) {
    throw new Error(`<${name}> did not provide an \`as\` value to <Render>`);
  }

  let element = typeof as === "string" ? getElementComponent(as) : as;
  if (!element) {
    throw new Error(
      `<${name}> has an invalid or unsupported \`as\` prop: ${as}`
    );
  }

  $: classStyle = $$props.class;
</script>

<svelte:component
  this={element}
  bind:el
  use={[...use, forwardEvents]}
  {...$$restProps}
  class={typeof classStyle === "function" ? classStyle(slot) : classStyle}
>
  <slot />
</svelte:component>
