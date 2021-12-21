<script lang="ts" context="module">
  import { getContext, setContext } from "svelte";
  let DISCLOSURE_PANEL_CONTEXT_NAME = "headlessui-disclosure-panel-context";

  export function usePanelContext(): string | undefined {
    return getContext(DISCLOSURE_PANEL_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import { useDisclosureContext, DisclosureStates } from "./Disclosure.svelte";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  const api = useDisclosureContext("DisclosureButton");
  $: id = $api.panelId;
  let openClosedState = useOpenClosed();

  setContext(DISCLOSURE_PANEL_CONTEXT_NAME, id);

  $: panelStore = $api.panelStore;

  $: visible =
    $openClosedState !== null
      ? $openClosedState === State.Open
      : $api.disclosureState === DisclosureStates.Open;

  $: propsWeControl = { id };

  $: slotProps = {
    open: $api.disclosureState === DisclosureStates.Open,
    close: $api.close,
  };
</script>

{#if visible}
  <Render
    {...{ ...$$restProps, ...propsWeControl }}
    {as}
    {slotProps}
    use={[...use, forwardEvents]}
    name={"DisclosurePanel"}
    bind:el={$panelStore}
  >
    <slot {...slotProps} />
  </Render>
{/if}
