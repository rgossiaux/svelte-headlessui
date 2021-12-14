<script lang="ts" context="module">
    export enum ListboxStates {
        Open,
        Closed,
    }
    export type ListboxOptionDataRef = {
        textValue: string;
        disabled: boolean;
        value: unknown;
    };

    export type StateDefinition = {
        // State
        listboxState: ListboxStates;
        value: any;
        orientation: "vertical" | "horizontal";

        labelRef: HTMLLabelElement | null;
        buttonRef: HTMLButtonElement | null;
        optionsRef: HTMLDivElement | null;

        disabled: boolean;
        options: { id: string; dataRef: ListboxOptionDataRef }[];
        searchQuery: string;
        activeOptionIndex: number | null;

        // State mutators
        closeListbox(): void;
        openListbox(): void;
        goToOption(focus: Focus, id?: string): void;
        search(value: string): void;
        clearSearch(): void;
        registerOption(id: string, dataRef: ListboxOptionDataRef): void;
        unregisterOption(id: string): void;
        select(value: unknown): void;
    };
</script>

<script lang="ts">
    import { Focus, calculateActiveIndex } from "./calculate-active-index";
    import { createEventDispatcher, setContext } from "svelte";
    import { writable, Writable } from "svelte/store";
    import { match } from "./match";
    import { State, useOpenClosedProvider } from "./open-closed";

    const dispatch = createEventDispatcher();

    let listboxState = ListboxStates.Closed;
    let labelStore = writable(null);
    setContext("labelStore", labelStore);
    $: labelRef = $labelStore;
    let buttonStore = writable(null);
    setContext("buttonStore", buttonStore);
    $: buttonRef = $buttonStore;
    let optionsStore = writable(null);
    setContext("optionsStore", optionsStore);
    $: optionsRef = $optionsStore;
    let options = [];
    let searchQuery = "";
    let activeOptionIndex = null;

    let api: Writable<StateDefinition | undefined> = writable();
    setContext("api", api);

    let openClosedState = writable(State.Closed);
    useOpenClosedProvider(openClosedState);
    $: openClosedState.set(
        match(listboxState, {
            [ListboxStates.Open]: State.Open,
            [ListboxStates.Closed]: State.Closed,
        })
    );

    export let disabled = false;
    export let horizontal = false;
    export let value: any;

    $: orientation = (horizontal ? "horizontal" : "vertical") as
        | "horizontal"
        | "vertical";
    $: api.set({
        listboxState,
        labelRef,
        value,
        buttonRef,
        optionsRef,
        options,
        searchQuery,
        activeOptionIndex,
        disabled,
        orientation,
        closeListbox() {
            if (disabled) return;
            if (listboxState === ListboxStates.Closed) return;
            listboxState = ListboxStates.Closed;
            activeOptionIndex = null;
        },
        openListbox() {
            if (disabled) return;
            if (listboxState === ListboxStates.Open) return;
            listboxState = ListboxStates.Open;
        },
        goToOption(focus: Focus, id?: string) {
            if (disabled) return;
            if (listboxState === ListboxStates.Closed) return;

            let nextActiveOptionIndex = calculateActiveIndex(
                focus === Focus.Specific
                    ? { focus: Focus.Specific, id: id! }
                    : { focus: focus as Exclude<Focus, Focus.Specific> },
                {
                    resolveItems: () => options,
                    resolveActiveIndex: () => activeOptionIndex,
                    resolveId: (option) => option.id,
                    resolveDisabled: (option) => option.disabled,
                }
            );

            if (
                searchQuery === "" &&
                activeOptionIndex === nextActiveOptionIndex
            )
                return;
            activeOptionIndex = nextActiveOptionIndex;
            searchQuery = "";
        },
        search(value: string) {
            if (disabled) return;
            if (listboxState === ListboxStates.Closed) return;

            searchQuery += value.toLowerCase();

            let match = options.findIndex(
                (option) =>
                    !option.disabled && option.textValue.startsWith(searchQuery)
            );

            if (match === -1 || match === activeOptionIndex) return;
            activeOptionIndex = match;
        },
        clearSearch() {
            if (disabled) return;
            if (listboxState === ListboxStates.Closed) return;
            if (searchQuery === "") return;

            searchQuery = "";
        },
        registerOption(id: string, dataRef) {
            options = [...options, { id, dataRef }];
        },
        unregisterOption(id: string) {
            let nextOptions = options.slice();
            let currentActiveOption =
                activeOptionIndex !== null
                    ? nextOptions[activeOptionIndex]
                    : null;
            let idx = nextOptions.findIndex((a) => a.id === id);
            if (idx !== -1) nextOptions.splice(idx, 1);
            options = nextOptions;
            activeOptionIndex = (() => {
                if (idx === activeOptionIndex) return null;
                if (currentActiveOption === null) return null;

                // If we removed the option before the actual active index, then it would be out of sync. To
                // fix this, we will find the correct (new) index position.
                return nextOptions.indexOf(currentActiveOption);
            })();
        },
        select(value: unknown) {
            if (disabled) return;
            dispatch("updateValue", { value });
        },
    });

    function handleMousedown(event: MouseEvent) {
        let target = event.target as HTMLElement;
        let active = document.activeElement;

        if (listboxState !== ListboxStates.Open) return;
        if (buttonRef?.contains(target)) return;

        if (!optionsRef?.contains(target)) $api.closeListbox();
        if (active !== document.body && active?.contains(target)) return; // Keep focus on newly clicked/focused element
        if (!event.defaultPrevented) {
            buttonRef?.focus({ preventScroll: true });
        }
    }
</script>

<svelte:window on:mousedown={handleMousedown} />
<slot open={listboxState === ListboxStates.Open} />
