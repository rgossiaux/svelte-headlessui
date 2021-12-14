<script lang="ts">
    import { getContext } from "svelte";
    import { ListboxStates, StateDefinition } from "./Listbox.svelte";
    import { useId } from "./use-id";
    let api: SvelteStore<StateDefinition> = getContext("api");
    let id = `headlessui-listbox-label-${useId()}`;
    let labelStore: SvelteStore<HTMLLabelElement> = getContext("labelStore");

    function handleClick() {
        $api.buttonRef?.focus({ preventScroll: true });
    }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label {...$$restProps} {id} bind:this={$labelStore} on:click={handleClick}>
    <slot
        open={$api.listboxState === ListboxStates.Open}
        disabled={$api.disabled}
    />
</label>
