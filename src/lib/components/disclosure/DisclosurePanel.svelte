<script lang="ts" context="module">
  import { getContext, setContext } from "svelte";
  let DISCLOSURE_PANEL_CONTEXT_NAME = "DisclosurePanelContext";

  export function usePanelContext(): string | undefined {
    return getContext(DISCLOSURE_PANEL_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import { useDisclosureContext, DisclosureStates } from "./Disclosure.svelte";
  import type { Writable } from "svelte/store";
  import { State } from "$lib/internal/open-closed";
  const api = useDisclosureContext("DisclosureButton");
  $: id = $api?.panelId;
  let openClosedState: Writable<State> | undefined = getContext("OpenClosed");

  setContext(DISCLOSURE_PANEL_CONTEXT_NAME, id);

  $: panelStore = $api?.panelStore;

  $: visible =
    $openClosedState !== null
      ? $openClosedState === State.Open
      : $api?.disclosureState === DisclosureStates.Open;

  $: propsWeControl = { id };
</script>

{#if visible}
  <div {...{ ...$$restProps, ...propsWeControl }} bind:this={$panelStore}>
    <slot
      open={$api?.disclosureState === DisclosureStates.Open}
      close={$api?.close}
    />
  </div>
{/if}
