<script lang="ts">
  import { createEventDispatcher, onMount, setContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";
  import { match } from "$lib/utils/match";
  import { State, useOpenClosedProvider } from "$lib/internal/open-closed";
  import { Reason, transition } from "$lib/utils/transition";
  import type { NestingContextValues } from "$lib/components/transitions/common.svelte";
  import {
    hasChildren,
    NESTING_CONTEXT_NAME,
    TreeStates,
    useNesting,
    useParentNesting,
    useTransitionContext,
  } from "$lib/components/transitions/common.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render, { Features, RenderStrategy } from "$lib/utils/Render.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "beforeEnter",
    "beforeLeave",
    "afterEnter",
    "afterLeave",
  ]);

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  export let enter = "";
  export let enterFrom = "";
  export let enterTo = "";
  export let entered = "";
  export let leave = "";
  export let leaveFrom = "";
  export let leaveTo = "";

  const dispatch = createEventDispatcher();

  let container: HTMLElement | null = null;

  let transitionContext = useTransitionContext();
  let nestingContext = useParentNesting();
  let state =
    $transitionContext.initialShow || $$props.unmount !== false
      ? TreeStates.Visible
      : TreeStates.Hidden;

  let initial = true;
  let id = useId();
  let isTransitioning = false;
  $: strategy =
    $$props.unmount === false ? RenderStrategy.Hidden : RenderStrategy.Unmount;

  let nesting: Writable<NestingContextValues> = writable(
    useNesting(() => {
      // When all children have been unmounted we can only hide ourselves if and only if we are not
      // transitioning ourselves. Otherwise we would unmount before the transitions are finished.
      if (!isTransitioning) {
        state = TreeStates.Hidden;
        $nestingContext.unregister(id);
        dispatch("afterLeave");
      }
    })
  );

  onMount(() => $nestingContext.register(id));

  $: {
    (() => {
      // If we are in another mode than the Hidden mode then ignore
      if (strategy !== RenderStrategy.Hidden) return;
      if (!id) return;

      // Make sure that we are visible
      if ($transitionContext.show && state !== TreeStates.Visible) {
        state = TreeStates.Visible;
        return;
      }

      match(state, {
        [TreeStates.Hidden]: () => $nestingContext.unregister(id),
        [TreeStates.Visible]: () => $nestingContext.register(id),
      });
    })();
  }

  function splitClasses(classes: string = "") {
    return classes
      .split(" ")
      .filter((className) => className.trim().length > 1);
  }

  $: enterClasses = splitClasses(enter);
  $: enterFromClasses = splitClasses(enterFrom);
  $: enterToClasses = splitClasses(enterTo);

  $: enteredClasses = splitClasses(entered);

  $: leaveClasses = splitClasses(leave);
  $: leaveFromClasses = splitClasses(leaveFrom);
  $: leaveToClasses = splitClasses(leaveTo);

  let mounted = false;
  onMount(() => (mounted = true));

  function executeTransition(show: boolean, appear: boolean) {
    // Skipping initial transition
    let skip = initial && !appear;

    let node = container;
    if (!node || !(node instanceof HTMLElement)) return;
    if (skip) return;

    isTransitioning = true;

    if (show) dispatch("beforeEnter");
    if (!show) dispatch("beforeLeave");

    return show
      ? transition(
          node,
          enterClasses,
          enterFromClasses,
          enterToClasses,
          enteredClasses,
          (reason) => {
            isTransitioning = false;
            if (reason === Reason.Finished) dispatch("afterEnter");
          }
        )
      : transition(
          node,
          leaveClasses,
          leaveFromClasses,
          leaveToClasses,
          enteredClasses,
          (reason) => {
            isTransitioning = false;

            if (reason !== Reason.Finished) return;

            // When we don't have children anymore we can safely unregister from the parent and hide
            // ourselves.
            if (!hasChildren($nesting)) {
              state = TreeStates.Hidden;
              $nestingContext.unregister(id);
              dispatch("afterLeave");
            }
          }
        );
  }

  let _cleanup: (() => void) | null | undefined = null;
  $: {
    if (mounted) {
      if (_cleanup) {
        _cleanup();
      }
      _cleanup = executeTransition(
        $transitionContext.show,
        $transitionContext.appear
      );
      initial = false;
    }
  }

  setContext(NESTING_CONTEXT_NAME, nesting);
  let openClosedState: Writable<State> = writable(State.Closed);
  useOpenClosedProvider(openClosedState);

  $: openClosedState.set(
    match(state, {
      [TreeStates.Visible]: State.Open,
      [TreeStates.Hidden]: State.Closed,
    })
  );

  // This is not in the base headless UI library, but is needed to prevent re-renders during the transition
  // from blowing away the transition classes
  $: classes = isTransitioning
    ? container?.className
    : `${$$props.class || ""} ${entered}`;
</script>

<Render
  {...$$restProps}
  {as}
  use={[...use, forwardEvents]}
  name={"TransitionChild"}
  bind:el={container}
  class={classes}
  visible={state === TreeStates.Visible}
  features={Features.RenderStrategy}
>
  <slot />
</Render>
