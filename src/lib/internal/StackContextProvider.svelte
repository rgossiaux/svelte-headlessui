<script lang="ts" context="module">
    export enum StackMessage {
        Add,
        Remove,
    }
</script>

<script lang="ts">
    import { getContext, setContext } from "svelte";
    import { writable, Writable } from "svelte/store";
    type OnUpdate = (
        message: StackMessage,
        element: HTMLElement | null
    ) => void;

    export let onUpdate: OnUpdate | undefined;
    export let element: HTMLElement | null;

    let parentUpdateStore: Writable<OnUpdate> | undefined =
        getContext("StackContext");
    let notifyStore: Writable<OnUpdate> = writable(() => {});
    setContext("StackContext", notifyStore);

    $: notifyStore.set((...args: Parameters<OnUpdate>) => {
        // Notify our layer
        onUpdate?.(...args);

        // Notify the parent
        $parentUpdateStore?.(...args);
    });

    $: _cleanup = (() => {
        if (_cleanup) {
            _cleanup();
        }
        if (!element) return null;
        $notifyStore(StackMessage.Add, element);
        return () => $notifyStore(StackMessage.Remove, element);
    })();
</script>

<slot />
