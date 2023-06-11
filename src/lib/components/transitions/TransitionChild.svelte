<script lang="ts" context="module">
  export type TTransitionProps = {
    enter?: string;
    /** Classes to add to the transitioning element before the enter phase starts */
    enterFrom?: string;
    /** Classes to add to the transitioning element immediately after the enter phase starts */
    enterTo?: string;
    /**
     * Classes to add to the transitioning element once the transition is done.
     * These classes will persist after that until the leave phase
     */
    entered?: string;
    /** Classes to add to the transitioning element during the entire leave phase */
    leave?: string;
    /** Classes to add to the transitioning element before the leave phase starts */
    leaveFrom?: string;
    /** Classes to add to the transitioning element immediately after the leave phase starts */
    leaveTo?: string;
    /** Whether the element should be unmounted, instead of just hidden, based on the open/closed state */
    unmount?: boolean;
    /**
     * A list of actions to apply to the component's HTML element.
     *
     * Each action must take the form `[action]` or `[action, options]`:
     *
     * use={[[action1], [action2, action2Options], [action3]]}
     */
    use?: HTMLActionArray;
    /** The class attribute for this component. It will always be present. */
    class?: string;
    /** The style attribute for this component. It will always be present. */
    style?: string;
    /** The element this component should render as */
    as?: SupportedAs;
  };

  type TTransitionChildProps = TTransitionProps & Omit<TRestProps<"div">, "as">;
</script>

<script lang="ts">
  import { createEventDispatcher, onMount, setContext } from "svelte";
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
  import Render, { RenderStrategy } from "$lib/utils/Render.svelte";
  import { Features, type TRestProps } from "$lib/types";

  /***** Props *****/
  type $$Props = TTransitionChildProps;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  export let enter = "";
  export let enterFrom = "";
  export let enterTo = "";
  export let entered = "";
  export let leave = "";
  export let leaveFrom = "";
  export let leaveTo = "";

  /***** Events *****/
  const dispatch = createEventDispatcher<{
    introstart: null;
    introend: null;
    outrostart: null;
    outroend: null;
  }>();

  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "introstart",
    "introend",
    "outrostart",
    "outroend",
  ]);

  /***** Component *****/
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

  let nesting = writable<NestingContextValues>(
    useNesting(() => {
      // When all children have been unmounted we can only hide ourselves if and only if we are not
      // transitioning ourselves. Otherwise we would unmount before the transitions are finished.
      if (!isTransitioning) {
        state = TreeStates.Hidden;
        $nestingContext.unregister(id);
        dispatch("outroend");
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

    if (show) dispatch("introstart");
    if (!show) dispatch("outrostart");

    return show
      ? transition(
          node,
          enterClasses,
          enterFromClasses,
          enterToClasses,
          enteredClasses,
          (reason) => {
            isTransitioning = false;
            if (reason === Reason.Finished) dispatch("introend");
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
              dispatch("outroend");
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
  let openClosedState = writable<State>(State.Closed);
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
  slotProps={{}}
  name={"TransitionChild"}
  bind:el={container}
  class={classes}
  visible={state === TreeStates.Visible}
  features={Features.RenderStrategy}
>
  <slot />
</Render>
