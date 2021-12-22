<script lang="ts" context="module">
  import {
    getElementComponent,
    SupportedElement,
  } from "$lib/internal/elements";
  import { get_current_component, SvelteComponent } from "svelte/internal";

  export enum Features {
    /** No features at all */
    None = 0,

    /**
     * When used, this will allow us to use one of the render strategies.
     *
     * **The render strategies are:**
     *    - **Unmount**   _(Will unmount the component.)_
     *    - **Hidden**    _(Will hide the component using the [hidden] attribute.)_
     */
    RenderStrategy = 1,

    /**
     * When used, this will allow the user of our component to be in control. This can be used when
     * you want to transition based on some state.
     */
    Static = 2,
  }

  export enum RenderStrategy {
    Unmount,
    Hidden,
  }
</script>

<script lang="ts">
  import type { ActionArray } from "$lib/hooks/use-actions";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let name: string;
  export let as: SvelteComponent | SupportedElement;
  export let el: HTMLElement | null = null;
  export let use: ActionArray = [];
  export let slotProps: unknown = {};
  export let visible = true;
  export let features: Features = Features.None;
  // The static and unmount props are only used in conjunction with the render strategies
  export let unmount = true;

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

  $: show =
    visible ||
    (features & Features.Static && $$props.static) ||
    !(features & Features.RenderStrategy && unmount);
  $: hidden =
    !visible &&
    !(features & Features.Static && $$props.static) &&
    features & Features.RenderStrategy &&
    !unmount;
</script>

{#if show}
  <svelte:component
    this={element}
    bind:el
    use={[...use, forwardEvents]}
    {...$$restProps}
    class={typeof classStyle === "function"
      ? classStyle(slotProps)
      : classStyle}
    style={hidden ? "display: none" : $$props.style}
    hidden={hidden || undefined}
  >
    <slot />
  </svelte:component>
{/if}
