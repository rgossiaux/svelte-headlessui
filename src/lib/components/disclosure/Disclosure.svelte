<script lang="ts" context="module">
    import { writable, Writable } from "svelte/store";
    import { getContext, setContext } from "svelte";
    export enum DisclosureStates {
        Open,
        Closed,
    }

    export interface StateDefinition {
        // State
        disclosureState: DisclosureStates;
        panelStore: Writable<HTMLElement | null>;
        panelId: string;
        buttonStore: Writable<HTMLButtonElement | null>;
        buttonId: string;

        // State mutators
        toggleDisclosure(): void;
        closeDisclosure(): void;

        // Exposed functions
        close(focusableElement: HTMLElement | HTMLElement | null): void;
    }

    let DISCLOSURE_CONTEXT_NAME = "DisclosureContext";

    export function useDisclosureContext(
        component: string
    ): Writable<StateDefinition | undefined> {
        let context: Writable<StateDefinition | undefined> | undefined =
            getContext(DISCLOSURE_CONTEXT_NAME);

        if (context === undefined) {
            throw new Error(
                `<${component} /> is missing a parent <Disclosure /> component.`
            );
        }

        return context;
    }
</script>

<script lang="ts">
    import { useId } from "./use-id";
    import { match } from "./match";
    import { State } from "./open-closed";
    export let defaultOpen = false;
    let buttonId = `headlessui-disclosure-button-${useId()}`;
    let panelId = `headlessui-disclosure-panel-${useId()}`;

    let disclosureState: StateDefinition["disclosureState"] = defaultOpen
        ? DisclosureStates.Open
        : DisclosureStates.Closed;
    let panelStore: StateDefinition["panelStore"] = writable(null);
    let buttonStore: StateDefinition["buttonStore"] = writable(null);

    let api: Writable<StateDefinition | undefined> = writable();
    setContext(DISCLOSURE_CONTEXT_NAME, api);

    $: api.set({
        buttonId,
        panelId,
        disclosureState,
        panelStore,
        buttonStore,
        toggleDisclosure() {
            disclosureState = match(disclosureState, {
                [DisclosureStates.Open]: DisclosureStates.Closed,
                [DisclosureStates.Closed]: DisclosureStates.Open,
            });
        },
        closeDisclosure() {
            if (disclosureState === DisclosureStates.Closed) return;
            disclosureState = DisclosureStates.Closed;
        },
        close(focusableElement: HTMLElement | null) {
            $api.closeDisclosure();

            let restoreElement = (() => {
                if (!focusableElement) return $buttonStore;
                if (focusableElement instanceof HTMLElement)
                    return focusableElement;

                return $buttonStore;
            })();

            restoreElement?.focus();
        },
    });

    let openClosedState: Writable<State> | undefined = writable();
    setContext("OpenClosed", openClosedState);

    $: $openClosedState = match(disclosureState, {
        [DisclosureStates.Open]: State.Open,
        [DisclosureStates.Closed]: State.Closed,
    });
</script>

<div {...$$restProps}>
    <slot
        open={disclosureState === DisclosureStates.Open}
        close={$api?.close}
    />
</div>
