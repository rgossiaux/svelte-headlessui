<script lang="ts" context="module">
  import type { SupportedAs, SupportedElement } from "$lib/internal/elements";
  import { getElementComponent } from "$lib/internal/elements";
  import { get_current_component } from "svelte/internal";

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

  type TRestProps<T> = T extends SupportedElement
    ? Omit<
        svelte.JSX.HTMLAttributes<HTMLElementTagNameMap[T]>,
        "class" | "style"
      >
    : {};

  type TResolveAs<TAsProp, TDefaultAs> = SupportedAs extends TAsProp
    ? TDefaultAs
    : TAsProp;
  type TRenderProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs,
    TDefaultAs
  > = TRestProps<TResolveAs<TAsProp, TDefaultAs>> & {
    name: string;
    as: TAsProp;
    slotProps: TSlotProps;
    el?: HTMLElement | null;
    use?: HTMLActionArray;
    visible?: boolean;
    features?: Features;
    static?: boolean;
    unmount?: boolean;
    class?: ((props: TSlotProps) => string) | string;
    style?: ((props: TSlotProps) => string) | string;
  };

  type TInternalProps = "name" | "slotProps" | "el" | "visible" | "features";

  export type TPassThroughProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs,
    TDefaultAs
  > = Omit<
    TRenderProps<TSlotProps, TAsProp, TDefaultAs>,
    TInternalProps | "as" | "static" | "unmount"
  > & {
    as?: TAsProp;
  };
</script>

<script lang="ts">
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import type { SvelteComponent } from "svelte";
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
