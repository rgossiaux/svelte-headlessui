<script lang="ts" context="module">
  type TComboboxOptionsProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "ul"> & {
    /** Whether the element should ignore the internally managed open/closed state */
    static?: boolean;
    /** Whether the element should be unmounted, instead of just hidden, based on the open/closed state	*/
    unmount?: boolean;
    /** */
    hold?: boolean;
  };
</script>

<script lang="ts">
  import { ComboboxStates, useComboboxContext } from "./Combobox.svelte";
  import { useId } from "$lib/hooks/use-id";
  import Render from "$lib/utils/Render.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { get_current_component } from "svelte/internal";
  import { Features, type TPassThroughProps } from "$lib/types";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import { treeWalker } from "$lib/hooks/use-tree-walker";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TComboboxOptionsProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "ul";
  export let hold: boolean = false;
  let _static: boolean = false;
  export { _static as static };
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let id = `headlessui-combobox-options-${useId()}`;
  let api = useComboboxContext("ComboboxOptions");

  let labelRef = $api.labelRef;
  let buttonRef = $api.buttonRef;
  let optionsRef = $api.optionsRef;
  let optionsPropsRef = $api.optionsPropsRef;

  $: $optionsPropsRef.static = _static;
  $: $optionsPropsRef.hold = hold;

  let usesOpenClosedState = useOpenClosed();
  $: visible =
    usesOpenClosedState !== undefined
      ? $usesOpenClosedState === State.Open
      : $api.comboboxState === ComboboxStates.Open;

  $: treeWalker({
    container: $optionsRef,
    enabled: $api.comboboxState === ComboboxStates.Open,
    accept(node) {
      if (node.getAttribute("role") === "option")
        return NodeFilter.FILTER_REJECT;
      if (node.hasAttribute("role")) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
    walk(node) {
      node.setAttribute("role", "none");
    },
  });

  $: propsWeControl = {
    "aria-activedescendant":
      $api.activeOptionIndex === null
        ? undefined
        : $api.options[$api.activeOptionIndex]?.id,
    "aria-labelledby": $labelRef?.id ?? $buttonRef?.id,
    id,
    role: "listbox",    
  };

  $: slotProps = {
    open: $api.comboboxState === ComboboxStates.Open,
  };
</script>

<Render
  {...$$restProps}
  {...propsWeControl}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"ComboboxOptions"}
  bind:el={$optionsRef}
  {visible}
  features={Features.RenderStrategy | Features.Static}
>
  <slot {...slotProps} />
</Render>
