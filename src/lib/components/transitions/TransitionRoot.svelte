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

    const TRANSITION_CONTEXT_NAME = "TransitionContext";
    export const NESTING_CONTEXT_NAME = "NestingContext";
    export function hasTransitionContext() {
        return getContext(TRANSITION_CONTEXT_NAME) !== undefined;
    }
    export function useTransitionContext(): Writable<TransitionContextValues> {
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

    export function useParentNesting(): Writable<NestingContextValues> {
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
        return (
            bag.filter(({ state }) => state === TreeStates.Visible).length > 0
        );
    }

    export function useNesting(done?: () => void) {
        let transitionableChildren: NestingContextValues["children"] = [];

        let mounted = false;
        onMount(() => (mounted = true));
        onDestroy(() => (mounted = false));

        function unregister(childId: ID, strategy = RenderStrategy.Hidden) {
            let idx = transitionableChildren.findIndex(
                ({ id }) => id === childId
            );
            if (idx === -1) return;

            match(strategy, {
                [RenderStrategy.Unmount]() {
                    transitionableChildren.splice(idx, 1);
                },
                [RenderStrategy.Hidden]() {
                    transitionableChildren[idx].state = TreeStates.Hidden;
                },
            });

            if (!hasChildren(transitionableChildren) && mounted) {
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
    import { getContext, onDestroy, onMount, setContext } from "svelte";

    import { writable, Writable } from "svelte/store";
    import { match } from "./match";
    import { State } from "./open-closed";
    import { RenderStrategy } from "./Render.svelte";
    import TransitionChild from "./TransitionChild.svelte";
    import type { useId } from "./use-id";

    export let show: boolean;
    export let unmount = true;
    export let appear = false;

    let openClosedState: Writable<State> | undefined = getContext("OpenClosed");

    $: shouldShow = (() => {
        if (show === null && openClosedState !== undefined) {
            return match($openClosedState, {
                [State.Open]: true,
                [State.Closed]: false,
            });
        }

        return show;
    })();

    $: if (shouldShow !== true && shouldShow !== false) {
        throw new Error(
            "A <Transition /> is used but it is missing a `show={true | false}` prop."
        );
    }
    $: state = shouldShow ? TreeStates.Visible : TreeStates.Hidden;

    let nestingBag: Writable<NestingContextValues> = writable();
    nestingBag.set(
        useNesting(() => {
            state = TreeStates.Hidden;
        })
    );

    let initial = true;
    let transitionBag: Writable<TransitionContextValues> = writable();
    $: transitionBag.set({
        show: shouldShow,
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

<TransitionChild {...$$restProps} {unmount}>
    <slot />
</TransitionChild>
