<script lang="ts" context="module">
  import { getContext, setContext } from "svelte";
  let DISCLOSURE_PANEL_CONTEXT_NAME = "headlessui-disclosure-panel-context";

  export function usePanelContext(): string | undefined {
    return getContext(DISCLOSURE_PANEL_CONTEXT_NAME);
  }
  type TDisclosurePanelProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {
    /** Whether the element should ignore the internally managed open/closed state */
    static?: boolean;
    /** Whether the element should be unmounted, instead of just hidden, based on the open/closed state	*/
    unmount?: boolean;
  };
</script>

<script lang="ts">
  import { useDisclosureContext, DisclosureStates } from "./Disclosure.svelte";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import { Features, type TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TDisclosurePanelProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  const api = useDisclosureContext("DisclosurePanel");
  let openClosedState = useOpenClosed();

  setContext(DISCLOSURE_PANEL_CONTEXT_NAME, $api.panelId);

  $: panelStore = $api.panelStore;

  $: visible =
    $openClosedState !== null
      ? $openClosedState === State.Open
      : $api.disclosureState === DisclosureStates.Open;

  $: propsWeControl = { id: $api.panelId };

  $: slotProps = {
    open: $api.disclosureState === DisclosureStates.Open,
    close: $api.close,
  };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"DisclosurePanel"}
  bind:el={$panelStore}
  {visible}
  features={Features.RenderStrategy | Features.Static}
>
  <slot {...slotProps} />
</Render>
