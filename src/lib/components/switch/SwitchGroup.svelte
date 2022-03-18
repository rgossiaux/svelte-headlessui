<script lang="ts" context="module">
  export interface StateDefinition {
    switchStore: Writable<HTMLButtonElement | null>;
  }

  const SWITCH_CONTEXT_NAME = "headlessui-switch-context";
  export function useSwitchContext(): Writable<StateDefinition> | undefined {
    return getContext(SWITCH_CONTEXT_NAME);
  }

  type TSwitchGroupProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {};
</script>

<script lang="ts">
  import DescriptionProvider from "$lib/components/description/DescriptionProvider.svelte";
  import LabelProvider from "$lib/components/label/LabelProvider.svelte";
  import { getContext, setContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TSwitchGroupProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let switchStore: StateDefinition["switchStore"] = writable(null);

  let api = writable<StateDefinition>({
    switchStore,
  });
  setContext(SWITCH_CONTEXT_NAME, api);

  function onClick() {
    if (!$switchStore) return;
    $switchStore.click();
    $switchStore.focus({ preventScroll: true });
  }

  $: slotProps = {};
</script>

<Render
  {...$$restProps}
  {as}
  use={[...use, forwardEvents]}
  {slotProps}
  name={"SwitchGroup"}
>
  <DescriptionProvider name="SwitchDescription">
    <LabelProvider name="SwitchLabel" {onClick}>
      <slot {...slotProps} />
    </LabelProvider>
  </DescriptionProvider>
</Render>
