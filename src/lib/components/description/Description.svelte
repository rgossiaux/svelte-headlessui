<script lang="ts">
    import { useId } from "./use-id";
    import { getContext, onMount } from "svelte";
    import { Writable } from "svelte/store";
    import { DescriptionContext } from "./DescriptionProvider.svelte";
    const id = `headlessui-description-${useId()}`;
    let contextStore: Writable<DescriptionContext> | undefined = getContext(
        "headlessui-description-context"
    );
    if (!contextStore) {
        throw new Error(
            "You used a <Description /> component, but it is not inside a relevant parent."
        );
    }

    onMount(() => $contextStore.register(id));
</script>

<p {...$$restProps} {...$contextStore?.props} {id}>
    <slot />
</p>
