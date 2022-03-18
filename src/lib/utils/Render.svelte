<script lang="ts" context="module">
  import type { SupportedAs } from "$lib/internal/elements";
  import { getElementComponent } from "$lib/internal/elements";
  import { get_current_component } from "svelte/internal";

  export enum RenderStrategy {
    Unmount,
    Hidden,
  }
</script>

<script lang="ts">
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import type { SvelteComponent } from "svelte";
  import { Features, type TRenderProps } from "$lib/types";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  type TSlotProps = $$Generic<{}>;
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TRenderProps<TSlotProps, TAsProp, TAsProp>;

  export let name: string;
  export let as: TAsProp;
  export let slotProps: TSlotProps;

  export let el: HTMLElement | null = null;
  export let use: HTMLActionArray = [];
  export let visible = true;
  export let features: Features = Features.None;
  // The static and unmount props are only used in conjunction with the render strategies
  export let unmount = true;
  let static_ = false;
  export { static_ as static };

  let classProp: ((props: TSlotProps) => string) | string | undefined =
    undefined;
  export { classProp as class };

  // This is not in upstream Headless UI, but we might as well add it here
  export let style: ((props: TSlotProps) => string) | string | undefined =
    undefined;

  if (!as) {
    throw new Error(`<${name}> did not provide an \`as\` value to <Render>`);
  }

  // This type is a lie (could also be undefined) but there's a type error if we allow undefined
  let element: typeof SvelteComponent =
    typeof as === "string" ? getElementComponent(as) : as;
  if (!element) {
    throw new Error(
      `<${name}> has an invalid or unsupported \`as\` prop: ${as}`
    );
  }

  $: computedClass =
    typeof classProp === "function" ? classProp(slotProps) : classProp;
  $: computedStyle = typeof style === "function" ? style(slotProps) : style;

  $: show =
    visible ||
    (features & Features.Static && static_) ||
    !(features & Features.RenderStrategy && unmount);
  $: hidden =
    !visible &&
    !(features & Features.Static && static_) &&
    features & Features.RenderStrategy &&
    !unmount;

  $: propsWeControl = {
    class: computedClass,
    style:
      `${computedStyle ?? ""}${hidden ? " display: none" : ""}` || undefined,
  };
  $: if (propsWeControl.style === undefined) {
    delete propsWeControl.style;
  }
</script>

{#if show}
  <svelte:component
    this={element}
    bind:el
    use={[...use, forwardEvents]}
    {...$$restProps}
    {...propsWeControl}
    hidden={hidden || undefined}
  >
    <slot />
  </svelte:component>
{/if}
