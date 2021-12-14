<script lang="ts">
    import { Keys } from "./keyboard";
    import { getFocusableElements, Focus, focusIn } from "./focus-management";
    import { getContext } from "svelte";
    import { writable, Writable } from "svelte/store";
    import { PopoverStates, StateDefinition } from "./Popover.svelte";
    import type { PopoverGroupContext } from "./PopoverGroup.svelte";
    import type { PopoverPanelContext } from "./PopoverPanel.svelte";
    let buttonStore: Writable<HTMLButtonElement> =
        getContext("PopoverButtonRef");
    export let disabled: Boolean = false;
    let api: Writable<StateDefinition> | undefined = getContext("PopoverApi");

    const groupContext: PopoverGroupContext | undefined =
        getContext("PopoverGroup");
    const closeOthers = groupContext?.closeOthers;

    let panelContext: PopoverPanelContext | undefined =
        getContext("PopoverPanel");
    let isWithinPanel =
        panelContext === null ? false : panelContext === $api.panelId;
    if (isWithinPanel) {
        buttonStore = writable();
    }

    // TODO: Revisit when handling Tab/Shift+Tab when using Portal's
    let activeElementRef: Element | null = null;
    let previousActiveElementRef: Element | null =
        typeof window === "undefined" ? null : document.activeElement;

    function handleFocus() {
        previousActiveElementRef = activeElementRef;
        activeElementRef = document.activeElement;
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (isWithinPanel) {
            if ($api.popoverState === PopoverStates.Closed) return;
            switch (event.key) {
                case Keys.Space:
                case Keys.Enter:
                    event.preventDefault(); // Prevent triggering a *click* event
                    event.stopPropagation();
                    $api.closePopover();
                    $api.button?.focus(); // Re-focus the original opening Button
                    break;
            }
        } else {
            switch (event.key) {
                case Keys.Space:
                case Keys.Enter:
                    event.preventDefault(); // Prevent triggering a *click* event
                    event.stopPropagation();
                    if ($api.popoverState === PopoverStates.Closed)
                        closeOthers?.($api.buttonId);
                    $api.togglePopover();
                    break;

                case Keys.Escape:
                    if ($api.popoverState !== PopoverStates.Open)
                        return closeOthers?.($api.buttonId);
                    if (!$api.button) return;
                    if (!$api.button?.contains(document.activeElement)) return;
                    event.preventDefault();
                    event.stopPropagation();
                    $api.closePopover();
                    break;

                case Keys.Tab:
                    if ($api.popoverState !== PopoverStates.Open) return;
                    if (!$api.panel) return;
                    if (!$api.button) return;

                    // TODO: Revisit when handling Tab/Shift+Tab when using Portal's
                    if (event.shiftKey) {
                        // Check if the last focused element exists, and check that it is not inside button or panel itself
                        if (!previousActiveElementRef) return;
                        if ($api.button?.contains(previousActiveElementRef))
                            return;
                        if ($api.panel?.contains(previousActiveElementRef))
                            return;

                        // Check if the last focused element is *after* the button in the DOM
                        let focusableElements = getFocusableElements();
                        let previousIdx = focusableElements.indexOf(
                            previousActiveElementRef as HTMLElement
                        );
                        let buttonIdx = focusableElements.indexOf($api.button!);
                        if (buttonIdx > previousIdx) return;

                        event.preventDefault();
                        event.stopPropagation();

                        focusIn($api.panel!, Focus.Last);
                    } else {
                        event.preventDefault();
                        event.stopPropagation();

                        focusIn($api.panel!, Focus.First);
                    }

                    break;
            }
        }
    }
    function handleKeyUp(event: KeyboardEvent) {
        if (isWithinPanel) return;
        if (event.key === Keys.Space) {
            // Required for firefox, event.preventDefault() in handleKeyDown for
            // the Space key doesn't cancel the handleKeyUp, which in turn
            // triggers a *click*.
            event.preventDefault();
        }
        if ($api.popoverState !== PopoverStates.Open) return;
        if (!$api.panel) return;
        if (!$api.button) return;

        // TODO: Revisit when handling Tab/Shift+Tab when using Portal's
        switch (event.key) {
            case Keys.Tab:
                // Check if the last focused element exists, and check that it is not inside button or panel itself
                if (!previousActiveElementRef) return;
                if ($api.button?.contains(previousActiveElementRef)) return;
                if ($api.panel?.contains(previousActiveElementRef)) return;

                // Check if the last focused element is *after* the button in the DOM
                let focusableElements = getFocusableElements();
                let previousIdx = focusableElements.indexOf(
                    previousActiveElementRef as HTMLElement
                );
                let buttonIdx = focusableElements.indexOf($api.button!);
                if (buttonIdx > previousIdx) return;

                event.preventDefault();
                event.stopPropagation();
                focusIn($api.panel!, Focus.Last);
                break;
        }
    }
    function handleClick() {
        if (disabled) return;
        if (isWithinPanel) {
            $api.closePopover();
            $api.button?.focus(); // Re-focus the original opening Button
        } else {
            if ($api.popoverState === PopoverStates.Closed)
                closeOthers?.($api.buttonId);
            $api.button?.focus();
            $api.togglePopover();
        }
    }

    $: propsWeControl = isWithinPanel
        ? {}
        : {
              id: $api.buttonId,
              "aria-expanded": disabled
                  ? undefined
                  : $api.popoverState === PopoverStates.Open,
              "aria-controls": $api.panel ? $api.panelId : undefined,
              disabled: disabled ? true : undefined,
          };
</script>

<svelte:window on:focus|capture={handleFocus} />

<button
    {...$$restProps}
    {...propsWeControl}
    on:click={handleClick}
    on:keydown={handleKeyDown}
    on:keyup={handleKeyUp}
    bind:this={$buttonStore}
>
    <slot open={$api.popoverState === PopoverStates.Open} />
</button>
