<script lang="ts">
    import {
        createEventDispatcher,
        getContext,
        onMount,
        setContext,
    } from "svelte";
    import { writable, Writable } from "svelte/store";
    import { match } from "./match";
    import { State } from "./open-closed";
    import { Reason, transition } from "./transition";

    import {
        hasChildren,
        NestingContextValues,
        NESTING_CONTEXT_NAME,
        TreeStates,
        useNesting,
        useParentNesting,
        useTransitionContext,
    } from "./TransitionRoot.svelte";
    import { useId } from "./use-id";

    export let unmount = true;
    export let enter = "";
    export let enterFrom = "";
    export let enterTo = "";
    export let entered = "";
    export let leave = "";
    export let leaveFrom = "";
    export let leaveTo = "";

    const dispatch = createEventDispatcher();

    let container: HTMLElement | null = null;
    let state = TreeStates.Visible;

    let transitionContext = useTransitionContext();
    let nestingContext = useParentNesting();

    let initial = true;

    let id = useId();

    let isTransitioning = false;

    let nesting: Writable<NestingContextValues> = writable();
    nesting.set(
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
            /* if (strategy.value !== RenderStrategy.Hidden) return */
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

    let enterClasses = splitClasses(enter);
    let enterFromClasses = splitClasses(enterFrom);
    let enterToClasses = splitClasses(enterTo);

    let enteredClasses = splitClasses(entered);

    let leaveClasses = splitClasses(leave);
    let leaveFromClasses = splitClasses(leaveFrom);
    let leaveToClasses = splitClasses(leaveTo);

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

    let _cleanup = null;
    $: if (mounted) {
        if (_cleanup) {
            _cleanup();
        }
        _cleanup = executeTransition(
            $transitionContext.show,
            $transitionContext.appear
        );
        initial = false;
    }

    setContext(NESTING_CONTEXT_NAME, nesting);
    let openClosedState: Writable<State> | undefined = writable();
    setContext("OpenClosed", openClosedState);

    $: openClosedState.set(
        match(state, {
            [TreeStates.Visible]: State.Open,
            [TreeStates.Hidden]: State.Closed,
        })
    );
</script>

<div bind:this={container} {...$$restProps}>
    <slot />
</div>
