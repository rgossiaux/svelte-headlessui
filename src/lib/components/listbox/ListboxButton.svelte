<script lang="ts">
    import { getContext, tick } from "svelte";
    import { ListboxStates, StateDefinition } from "./Listbox.svelte";
    import { useId } from "./use-id";
    import { Keys } from "./keyboard";
    import { Focus } from "./calculate-active-index";
    let api: SvelteStore<StateDefinition> = getContext("api");
    let id = `headlessui-listbox-button-${useId()}`;
    let buttonStore: SvelteStore<HTMLButtonElement> = getContext("buttonStore");

    async function handleKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
            case Keys.Space:
            case Keys.Enter:
            case Keys.ArrowDown:
                event.preventDefault();
                $api.openListbox();
                await tick();
                $api.optionsRef?.focus({ preventScroll: true });
                if (!$api.value) $api.goToOption(Focus.First);
                break;

            case Keys.ArrowUp:
                event.preventDefault();
                $api.openListbox();
                await tick();
                $api.optionsRef?.focus({ preventScroll: true });
                if (!$api.value) $api.goToOption(Focus.Last);
                break;
        }
    }

    function handleKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case Keys.Space:
                // Required for firefox, event.preventDefault() in handleKeyDown for
                // the Space key doesn't cancel the handleKeyUp, which in turn
                // triggers a *click*.
                event.preventDefault();
                break;
        }
    }

    async function handleClick(event: MouseEvent) {
        if ($api.disabled) return;
        if ($api.listboxState === ListboxStates.Open) {
            $api.closeListbox();
            await tick();
            $api.buttonRef?.focus({ preventScroll: true });
        } else {
            event.preventDefault();
            $api.openListbox();
            await tick();
            $api.optionsRef?.focus({ preventScroll: true });
        }
    }

    $: propsWeControl = {
        id,
        "aria-haspopup": true,
        "aria-controls": $api?.optionsRef?.id,
        "aria-expanded": $api?.disabled
            ? undefined
            : $api?.listboxState === ListboxStates.Open,
        "aria-labelledby": $api?.labelRef
            ? [$api?.labelRef?.id, id].join(" ")
            : undefined,
        disabled: $api?.disabled === true ? true : undefined,
    };
</script>

<button
    {...$$restProps}
    {...propsWeControl}
    bind:this={$buttonStore}
    on:click={handleClick}
    on:keydown={handleKeyDown}
    on:keyup={handleKeyUp}
>
    <slot
        open={$api.listboxState === ListboxStates.Open}
        disabled={$api.disabled}
    />
</button>
