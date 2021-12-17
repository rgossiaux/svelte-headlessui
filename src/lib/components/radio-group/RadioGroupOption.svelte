<script lang="ts">
  import { onDestroy } from "svelte";
  import DescriptionProvider from "$lib/components/description/DescriptionProvider.svelte";
  import LabelProvider from "$lib/components/label/LabelProvider.svelte";

  import { useRadioGroupContext, Option } from "./RadioGroup.svelte";
  import { useId } from "$lib/hooks/use-id";

  enum OptionState {
    Empty = 1 << 0,
    Active = 1 << 1,
  }

  export let value: any;
  export let disabled: boolean = false;
  let api = useRadioGroupContext("RadioGroupOption");
  let id = `headlessui-radiogroup-option-${useId()}`;
  let optionRef: HTMLElement | null = null;
  $: propsRef = { value, disabled };
  let state = OptionState.Empty;

  function updateOption(option: Option) {
    $api?.unregisterOption(option.id);
    $api?.registerOption(option);
  }
  $: updateOption({ id, element: optionRef, propsRef });
  onDestroy(() => $api?.unregisterOption(id));

  $: isFirstOption = $api?.firstOption?.id === id;
  $: isDisabled = $api?.disabled || disabled;
  $: checked = $api?.value === value;

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

  $: classStyle = $$props.class
    ? typeof $$props.class === "function"
      ? $$props.class({
          active: state & OptionState.Active,
          checked,
          disabled: isDisabled,
        })
      : $$props.class
    : "";

  $: propsWeControl = {
    id,
    class: classStyle,
    role: "radio",
    "aria-checked": checked ? ("true" as const) : ("false" as const),
    "aria-disabled": isDisabled ? true : undefined,
    tabIndex: tabIndex,
  };
</script>

<DescriptionProvider name="RadioGroup.Description" let:describedby>
  <LabelProvider name="RadioGroup.Label" let:labelledby>
    <div
      {...{ ...$$restProps, ...propsWeControl }}
      bind:this={optionRef}
      aria-labelledby={labelledby}
      aria-describedby={describedby}
      on:click={isDisabled ? undefined : handleClick}
      on:focus={isDisabled ? undefined : handleFocus}
      on:blur={isDisabled ? undefined : handleBlur}
    >
      <slot
        {checked}
        disabled={isDisabled}
        active={state & OptionState.Active}
      />
    </div>
  </LabelProvider>
</DescriptionProvider>
