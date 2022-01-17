<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";
  import { match } from "$lib/utils/match";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import TransitionChild from "$lib/components/transitions/TransitionChild.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import type {
    NestingContextValues,
    TransitionContextValues,
  } from "./common.svelte";
  import {
    hasChildren,
    NESTING_CONTEXT_NAME,
    TRANSITION_CONTEXT_NAME,
    TreeStates,
    useNesting,
  } from "./common.svelte";
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

  let initialShow = shouldShow;

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
    initialShow: !!initialShow,
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
