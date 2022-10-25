<script lang="ts" context="module">
  type TComboboxOptionProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "li"> & {
    /** The option value */
    value: unknown;
    /** Whether the option should be disabled for keyboard navigation and ARIA purposes */
    disabled?: boolean;
  };
</script>

<script lang="ts">
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { useId } from "$lib/hooks/use-id";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import type { TPassThroughProps } from "$lib/types";
  import { Focus } from "$lib/utils/calculate-active-index";
  import { match } from "$lib/utils/match";
  import Render from "$lib/utils/Render.svelte";
  import { get_current_component, onMount, tick } from "svelte/internal";
  import { writable, type Writable } from "svelte/store";
  import {
    ActivationTrigger,
    ComboboxStates,
    useComboboxContext,
    ValueMode,
    type ComboboxOptionData
  } from "./Combobox.svelte";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TComboboxOptionProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "li";
  export let value: Object | string | number | boolean;
  export let disabled: boolean = false;
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let id = `headlessui-combobox-option-${useId()}`;
  let api = useComboboxContext("ComboboxOption");

  let internalOptionRef: Writable<HTMLElement | null> = writable(null);
  let optionsPropsRef = $api.optionsPropsRef;
  let internalValue: Writable<Object | string | number | boolean> =
    writable(value);

  $: active =
    $api.activeOptionIndex !== null
      ? $api.options[$api.activeOptionIndex].id === id
      : false;

  $: selected = match($api.mode, {
    [ValueMode.Single]: () => $api.compare($api.value, value),
    [ValueMode.Multi]: () =>
      ($api.value as unknown[]).some((v) => $api.compare(v, value)),
  });

  $: internalValue.set(value)
  let dataRef: ComboboxOptionData;
  $: (dataRef = {
    disabled: disabled,
    value: internalValue,
    domRef: internalOptionRef,
  }) as ComboboxOptionData;

  onMount(() => {
    $api.registerOption(id, dataRef);
    return () => {
      $api.unregisterOption(id);
    };
  });

  async function scrollIntoViewIfActive(
    newState: ComboboxStates,
    newActive: boolean,
    newActivationTrigger: ActivationTrigger
  ) {
    if (newState !== ComboboxStates.Open) return;
    if (!newActive) return;
    if (newActivationTrigger === ActivationTrigger.Pointer) return;

    await tick();

    $internalOptionRef?.scrollIntoView?.({ block: "nearest" });
  }

  $: scrollIntoViewIfActive($api.comboboxState, active, $api.activationTrigger);

  function handleClick(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    if (disabled) return event.preventDefault();

    $api.selectOption(id);
    if ($api.mode === ValueMode.Single) {
      $api.closeCombobox();
    }
  }

  function handleFocus() {
    if (disabled) return $api.goToOption(Focus.Nothing);
    $api.goToOption(Focus.Specific, id);
  }

  function handleMove() {
    if (disabled) return;
    if (active) return;
    $api.goToOption(Focus.Specific, id, ActivationTrigger.Pointer);
  }

  function handleLeave() {
    if (disabled) return;
    if (!active) return;
    if ($optionsPropsRef.hold) return;
    $api.goToOption(Focus.Nothing);
  }

  $: propsWeControl = {
    id,
    ref: internalOptionRef,
    role: "option",
    tabIndex: disabled === true ? undefined : -1,
    "aria-disabled": disabled === true ? true : undefined,
    // According to the WAI-ARIA best practices, we should use aria-checked for
    // multi-select,but Voice-Over disagrees. So we use aria-checked instead for
    // both single and multi-select.
    "aria-selected": selected,
    disabled: undefined, // Never forward the `disabled` prop
  };

  $: slotProps = {
    active,
    selected,
    disabled,
  };
</script>

<Render
  {...$$restProps}
  {...propsWeControl}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"ComboboxOption"}
  bind:el={$internalOptionRef}
  on:click={handleClick}
  on:focus={handleFocus}
  on:pointermove={handleMove}
  on:mousemove={handleMove}
  on:pointerleave={handleLeave}
  on:mouseleave={handleLeave}
>
  <slot {...slotProps} />
</Render>