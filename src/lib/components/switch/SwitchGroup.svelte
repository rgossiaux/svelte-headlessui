<script lang="ts" context="module">
  export interface StateDefinition {
    switchStore: Writable<HTMLButtonElement | null>;
  }

  const SWITCH_CONTEXT_NAME = "SwitchContext";
  export function useSwitchContext(): Writable<StateDefinition> | undefined {
    return getContext(SWITCH_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import DescriptionProvider from "$lib/components/description/DescriptionProvider.svelte";
  import LabelProvider from "$lib/components/label/LabelProvider.svelte";
  import { getContext, setContext } from "svelte";
  import { Writable, writable } from "svelte/store";

  let switchStore: Writable<HTMLButtonElement | null> = writable(null);

  let api: Writable<StateDefinition | undefined> = writable({
    switchStore,
  });
  setContext(SWITCH_CONTEXT_NAME, api);

  function onClick() {
    if (!$switchStore) return;
    $switchStore.click();
    $switchStore.focus({ preventScroll: true });
  }
</script>

<div {...$$restProps}>
  <DescriptionProvider name="Switch.Description">
    <LabelProvider name="Switch.Label" {onClick}>
      <slot />
    </LabelProvider>
  </DescriptionProvider>
</div>
