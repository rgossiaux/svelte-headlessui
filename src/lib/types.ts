/// <reference types="svelte2tsx/svelte-jsx" />

import type { HTMLActionArray } from "./hooks/use-actions";
import type { SupportedAs, SupportedElement } from "./internal/elements";

// Can't figure out how to import from Render.svelte, so this must be moved here instead.
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

export type TRestProps<T> = T extends SupportedElement
  ? Omit<
    svelteHTML.IntrinsicElements[T],
    "class" | "style"
  >
  : {};

export type TResolveAs<TAsProp, TDefaultAs> = SupportedAs extends TAsProp
  ? TDefaultAs
  : TAsProp;

export type TRenderProps<
  TSlotProps extends {},
  TAsProp extends SupportedAs,
  TDefaultAs
  > = TRestProps<TResolveAs<TAsProp, TDefaultAs>> & {
    name: string;
    slotProps: TSlotProps;
    el?: HTMLElement | null;
    visible?: boolean;
    features?: Features;
    as: TAsProp;
    static?: boolean;
    unmount?: boolean;
    /**
     * A list of actions to apply to the component's HTML element.
     *
     * Each action must take the form `[action]` or `[action, options]`:
     *
     * use={[[action1], [action2, action2Options], [action3]]}
     */
    use?: HTMLActionArray;
    /**
     * The class attribute for this component.
     *
     * In addition to a regular string, this may be a function that returns a string.
     * In that case, the function will be passed this component's slot props as an argument,
     * allowing you to conditionally apply classes. See the component's documentation for more.
     */
    class?: ((props: TSlotProps) => string) | string;
    /**
     * The style attribute for this component.
     *
     * In addition to a regular string, this may be a function that returns a string.
     * In that case, the function will be passed this component's slot props as an argument,
     * allowing you to conditionally apply styles. See the component's documentation for more.
     */
    style?: ((props: TSlotProps) => string) | string;
  };

export type TInternalProps = "name" | "slotProps" | "el" | "visible" | "features";

export type TPassThroughProps<
  TSlotProps extends {},
  TAsProp extends SupportedAs,
  TDefaultAs
  > = Omit<
    TRenderProps<TSlotProps, TAsProp, TDefaultAs>,
    TInternalProps | "as" | "static" | "unmount"
  > & {
    /** The HTML element the component should render as */
    as?: TAsProp;
  };
