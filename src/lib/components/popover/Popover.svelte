<script lang="ts" context="module">
    export enum PopoverStates {
        Open,
        Closed,
    }
    export interface StateDefinition {
        // State
        popoverState: PopoverStates;
        button: HTMLElement | null;
        buttonId: string;
        panel: HTMLElement | null;
        panelId: string;

        // State mutators
        togglePopover(): void;
        closePopover(): void;

        // Exposed functions
        close(focusableElement: HTMLElement | null): void;
    }

    export interface PopoverRegisterBag {
        buttonId: string;
        panelId: string;
        close(): void;
    }
</script>

<script lang="ts">
    import { match } from "./match";
    import { useId } from "./use-id";
    import { isFocusableElement, FocusableMode } from "./focus-management";
    import { State } from "./open-closed";
    import type { PopoverGroupContext } from "./PopoverGroup.svelte";
    import { getContext, setContext, onMount } from "svelte";
    import { writable, Writable } from "svelte/store";
    const buttonId = `headlessui-popover-button-${useId()}`;
    const panelId = `headlessui-popover-panel-${useId()}`;

    let popoverState: PopoverStates = PopoverStates.Closed;

    let api: Writable<StateDefinition | undefined> = writable();
    setContext("PopoverApi", api);

    let openClosedState: Writable<State> | undefined = writable();
    setContext("OpenClosed", openClosedState);

    $: $openClosedState = match(popoverState, {
        [PopoverStates.Open]: State.Open,
        [PopoverStates.Closed]: State.Closed,
    });

    let panelStore = writable(null);
    setContext("PopoverPanelRef", panelStore);
    $: panel = $panelStore;

    let buttonStore = writable(null);
    setContext("PopoverButtonRef", buttonStore);
    $: button = $buttonStore;

    $: api.set({
        popoverState,
        buttonId,
        panelId,
        panel,
        button,
        togglePopover() {
            popoverState = match(popoverState, {
                [PopoverStates.Open]: PopoverStates.Closed,
                [PopoverStates.Closed]: PopoverStates.Open,
            });
        },
        closePopover() {
            if (popoverState === PopoverStates.Closed) return;
            popoverState = PopoverStates.Closed;
        },
        close(focusableElement: HTMLElement | null) {
            $api.closePopover();

            let restoreElement = (() => {
                if (!focusableElement) return $api.button;
                if (focusableElement instanceof HTMLElement)
                    return focusableElement;

                return $api.button;
            })();

            restoreElement?.focus();
        },
    });

    const registerBag = {
        buttonId,
        panelId,
        close() {
            $api.closePopover();
        },
    };

    const groupContext: PopoverGroupContext | undefined =
        getContext("PopoverGroup");
    const registerPopover = groupContext?.registerPopover;

    function isFocusWithinPopoverGroup() {
        return (
            groupContext?.isFocusWithinPopoverGroup() ??
            (button?.contains(document.activeElement) ||
                panel?.contains(document.activeElement))
        );
    }

    onMount(() => registerPopover?.(registerBag));

    // Handle focus out
    function handleFocus() {
        if (popoverState !== PopoverStates.Open) return;
        if (isFocusWithinPopoverGroup()) return;
        if (!button) return;
        if (!panel) return;

        $api.closePopover();
    }

    // Handle outside click
    function handleMousedown(event: MouseEvent) {
        let target = event.target as HTMLElement;

        if (popoverState !== PopoverStates.Open) return;

        if (button?.contains(target)) return;
        if (panel?.contains(target)) return;

        $api.closePopover();

        if (!isFocusableElement(target, FocusableMode.Loose)) {
            event.preventDefault();
            button?.focus();
        }
    }
</script>

<svelte:window on:focus|capture={handleFocus} on:mousedown={handleMousedown} />
<div {...$$restProps}>
    <slot open={popoverState === PopoverStates.Open} close={$api.close} />
</div>
