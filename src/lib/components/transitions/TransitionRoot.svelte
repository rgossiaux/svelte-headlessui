<script lang="ts" context="module">
  export enum TreeStates {
    Visible = "visible",
    Hidden = "hidden",
  }

  type ID = ReturnType<typeof useId>;

  export interface NestingContextValues {
    children: { id: ID; state: TreeStates }[];
    register: (id: ID) => () => void;
    unregister: (id: ID, strategy?: RenderStrategy) => void;
  }

  interface TransitionContextValues {
    show: boolean;
    appear: boolean;
  }

  const TRANSITION_CONTEXT_NAME = "headlessui-transition-context";
  export const NESTING_CONTEXT_NAME = "headlessui-nesting-context";
  export function hasTransitionContext() {
    return getContext(TRANSITION_CONTEXT_NAME) !== undefined;
  }
  export function useTransitionContext(): Readable<TransitionContextValues> {
    let context = getContext(TRANSITION_CONTEXT_NAME) as
      | Writable<TransitionContextValues>
      | undefined;
    if (context === undefined) {
      throw new Error(
        "A <TransitionChild /> is used but it is missing a parent <TransitionRoot />."
      );
    }

    return context;
  }

  export function useParentNesting(): Readable<NestingContextValues> {
    let context = getContext(NESTING_CONTEXT_NAME) as
      | Writable<NestingContextValues>
      | undefined;
    if (context === undefined) {
      throw new Error(
        "A <TransitionChild /> is used but it is missing a parent <TransitionRoot />."
      );
    }

    return context;
  }

  export function hasChildren(
    bag:
      | NestingContextValues["children"]
      | { children: NestingContextValues["children"] }
  ): boolean {
    if ("children" in bag) return hasChildren(bag.children);
    return bag.filter(({ state }) => state === TreeStates.Visible).length > 0;
  }

  export function useNesting(done?: () => void) {
    let transitionableChildren: NestingContextValues["children"] = [];

    function unregister(childId: ID, strategy = RenderStrategy.Hidden) {
      let idx = transitionableChildren.findIndex(({ id }) => id === childId);
      if (idx === -1) return;

      let hadChildren = hasChildren(transitionableChildren);

      match(strategy, {
        [RenderStrategy.Unmount]() {
          transitionableChildren.splice(idx, 1);
        },
        [RenderStrategy.Hidden]() {
          transitionableChildren[idx].state = TreeStates.Hidden;
        },
      });

      if (hadChildren && !hasChildren(transitionableChildren)) {
        done?.();
      }
    }

    function register(childId: ID) {
      let child = transitionableChildren.find(({ id }) => id === childId);
      if (!child) {
        transitionableChildren.push({
          id: childId,
          state: TreeStates.Visible,
        });
      } else if (child.state !== TreeStates.Visible) {
        child.state = TreeStates.Visible;
      }

      return () => unregister(childId, RenderStrategy.Unmount);
    }

    return {
      children: transitionableChildren,
      register,
      unregister,
    };
  }
</script>

<script lang="ts">
  import { getContext, onMount, setContext } from "svelte";

  import { Readable, writable, Writable } from "svelte/store";
  import { match } from "$lib/utils/match";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import { RenderStrategy } from "$lib/utils/Render.svelte";
  import TransitionChild from "./TransitionChild.svelte";
  import type { useId } from "$lib/hooks/use-id";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "beforeEnter",
    "beforeLeave",
    "afterEnter",
    "afterLeave",
  ]);

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  export let show: boolean | undefined = undefined;
  export let appear = false;

  let openClosedState = useOpenClosed();

  function computeShow(
    show: boolean | undefined,
    openClosedState: State | undefined
  ): boolean | undefined {
    if (show === undefined && openClosedState !== undefined) {
      return match(openClosedState, {
        [State.Open]: true,
        [State.Closed]: false,
      });
    }

    return show;
  }

  let shouldShow = computeShow(
    show,
    openClosedState !== undefined ? $openClosedState : undefined
  );
  $: {
    shouldShow = computeShow(
      show,
      openClosedState !== undefined ? $openClosedState : undefined
    );
    if (shouldShow !== true && shouldShow !== false) {
      throw new Error(
        "A <Transition /> is used but it is missing a `show={true | false}` prop."
      );
    }
  }
  let state = shouldShow ? TreeStates.Visible : TreeStates.Hidden;

  let nestingBag: Writable<NestingContextValues> = writable(
    useNesting(() => {
      state = TreeStates.Hidden;
    })
  );

  let initial = true;
  let transitionBag: Writable<TransitionContextValues> = writable();
  $: transitionBag.set({
    show: !!shouldShow,
    appear: appear || !initial,
  });

  onMount(() => {
    initial = false;
  });

  $: if (!initial) {
    if (shouldShow) {
      state = TreeStates.Visible;
    } else if (!hasChildren($nestingBag)) {
      state = TreeStates.Hidden;
    }
  }

  setContext(NESTING_CONTEXT_NAME, nestingBag);
  setContext(TRANSITION_CONTEXT_NAME, transitionBag);
</script>

{#if state === TreeStates.Visible || $$props.unmount === false}
  <TransitionChild
    {...$$restProps}
    {as}
    use={[...use, forwardEvents]}
    on:afterEnter
    on:afterLeave
    on:beforeEnter
    on:beforeLeave
  >
    <slot />
  </TransitionChild>
{/if}
