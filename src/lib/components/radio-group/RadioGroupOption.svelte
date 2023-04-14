<script lang="ts" context="module">
  type TRadioGroupOptionProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {
    /**
     * The value of the `RadioGroupOption`.
     * The type should match the type of the value prop in the `RadioGroup`
     */
    value: unknown;
    /** Whether the `RadioGroupOption` is disabled */
    disabled?: boolean;
  };
</script>

<script lang="ts">
  import { onDestroy } from "svelte";
  import DescriptionProvider from "$lib/components/description/DescriptionProvider.svelte";
  import LabelProvider from "$lib/components/label/LabelProvider.svelte";
  import type { Option } from "./RadioGroup.svelte";
  import { useRadioGroupContext } from "./RadioGroup.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TRadioGroupOptionProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];
  export let value: unknown;
  export let disabled: boolean = false;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  enum OptionState {
    Empty = 1 << 0,
    Active = 1 << 1,
  }

  let api = useRadioGroupContext("RadioGroupOption");
  let id = `headlessui-radiogroup-option-${useId()}`;
  let optionRef: HTMLElement | null = null;
  $: propsRef = { value, disabled };
  let state = OptionState.Empty;

  function updateOption(option: Option) {
    $api.unregisterOption(option.id);
    $api.registerOption(option);
  }
  $: updateOption({ id, element: optionRef, propsRef });
  onDestroy(() => $api.unregisterOption(id));

  $: isFirstOption = $api.firstOption?.id === id;
  $: isDisabled = $api.disabled || disabled;
  $: checked = $api.value === value;

  $: tabIndex = (() => {
    if (isDisabled) return -1;
    if (checked) return 0;
    if (!$api.containsCheckedOption && isFirstOption) return 0;
    return -1;
  })();

  function handleClick() {
    if (!$api.change(value)) return;

    state |= OptionState.Active;
    optionRef?.focus();
  }
  function handleFocus() {
    state |= OptionState.Active;
  }
  function handleBlur() {
    state &= ~OptionState.Active;
  }

  $: propsWeControl = {
    id,
    role: "radio",
    "aria-checked": checked ? ("true" as const) : ("false" as const),
    "aria-disabled": isDisabled ? true : undefined,
    tabIndex: tabIndex,
  };

  $: slotProps = {
    checked,
    disabled: isDisabled,
    active: !!(state & OptionState.Active),
  };
</script>

<DescriptionProvider name="RadioGroupDescription" {slotProps} let:describedby>
  <LabelProvider name="RadioGroupLabel" {slotProps} let:labelledby>
    <Render
      {...{ ...$$restProps, ...propsWeControl }}
      {as}
      {slotProps}
      use={[...use, forwardEvents]}
      name={"RadioGroupOption"}
      bind:el={optionRef}
      aria-labelledby={labelledby}
      aria-describedby={describedby}
      on:click={isDisabled ? () => {} : handleClick}
      on:focus={isDisabled ? () => {} : handleFocus}
      on:blur={isDisabled ? () => {} : handleBlur}
    >
      <slot {...slotProps} />
    </Render>
  </LabelProvider>
</DescriptionProvider>
