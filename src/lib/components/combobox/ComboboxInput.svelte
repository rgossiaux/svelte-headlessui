<script lang="ts" context="module">
  type TComboboxInputProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "input"> & {
    /** Whether the element should ignore the internally managed open/closed state */
    static?: boolean;
    /** Whether the element should be unmounted, instead of just hidden, based on the open/closed state	*/
    unmount?: boolean;
    /** Pass a function to return the string representation of your value. */
    displayValue?: (item: any | unknown) => string;
  };
</script>

<script lang="ts">
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { useId } from "$lib/hooks/use-id";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { Features, type TPassThroughProps } from "$lib/types";
  import { Focus } from "$lib/utils/calculate-active-index";
  import { Keys } from "$lib/utils/keyboard";
  import { match } from "$lib/utils/match";
  import Render from "$lib/utils/Render.svelte";
  import {
    createEventDispatcher,
    get_current_component,
    onMount,
    tick
  } from "svelte/internal";
  import {
    ComboboxStates,
    useComboboxContext,
    ValueMode
  } from "./Combobox.svelte";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TComboboxInputProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "input";
  export let displayValue: ((item: unknown) => string) | undefined = undefined;
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "change",
  ]);

  const dispatch = createEventDispatcher<{
    change: any;
  }>();

  /***** Component *****/
  let id = `headlessui-combobox-input-${useId()}`;
  let api = useComboboxContext("ComboboxInput");

  let labelRef = $api.labelRef;
  let buttonRef = $api.buttonRef;
  let inputRef = $api.inputRef;
  let optionsRef = $api.optionsRef;
  let optionsPropsRef = $api.optionsPropsRef;

  let currentValue = $api.value as unknown as string;

  let getCurrentValue = () => {
    let value = $api.value;
    if (!$inputRef) return "";

    if (typeof displayValue !== "undefined") {
      return displayValue(value as unknown) ?? "";
    } else if (typeof value === "string") {
      return value;
    } else {
      return "";
    }
  };

  function handleStateChange(state: ComboboxStates) {
    let input = $inputRef;
    if (!input) return;

    const newValue = getCurrentValue();

    if (state === ComboboxStates.Closed && input.value != newValue)
      input.value = newValue;
  }
  $: handleStateChange($api.comboboxState);

  onMount(() => {
    $inputRef!.value = getCurrentValue();
  });

  async function handleKeyDown(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

      case Keys.Backspace:
      case Keys.Delete:
        if ($api.mode !== ValueMode.Single) return;
        if (!$api.nullable) return;

        let input = event.currentTarget as HTMLInputElement;
        requestAnimationFrame(() => {
          if (input.value === "") {
            $api.change(null);
            let options = $optionsRef;
            if (options) {
              options.scrollTop = 0;
            }
            $api.goToOption(Focus.Nothing);
          }
        });
        break;

      case Keys.Enter:
        if ($api.comboboxState !== ComboboxStates.Open) return;
        if (event.isComposing) return;

        event.preventDefault();
        event.stopPropagation();

        if ($api.activeOptionIndex === null) {
          $api.closeCombobox();
          return;
        }

        $api.selectActiveOption();
        if ($api.mode === ValueMode.Single) {
          $api.closeCombobox();
        }
        break;

      case Keys.ArrowDown:
        event.preventDefault();
        event.stopPropagation();
        return match($api.comboboxState, {
          [ComboboxStates.Open]: () => $api.goToOption(Focus.Next),
          [ComboboxStates.Closed]: () => $api.openCombobox(),
        });

      case Keys.ArrowUp:
        event.preventDefault();
        event.stopPropagation();
        return match($api.comboboxState, {
          [ComboboxStates.Open]: () => $api.goToOption(Focus.Previous),
          [ComboboxStates.Closed]: async () => {
            $api.openCombobox();
            await tick();
            if (!$api.value) {
              $api.goToOption(Focus.Last);
            }
          },
        });

      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault();
        event.stopPropagation();
        return $api.goToOption(Focus.First);

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault();
        event.stopPropagation();
        return $api.goToOption(Focus.Last);

      case Keys.Escape:
        if ($api.comboboxState !== ComboboxStates.Open) return;
        event.preventDefault();
        if ($optionsRef && !$optionsPropsRef.static) {
          event.stopPropagation();
        }
        $api.closeCombobox();
        break;

      case Keys.Tab:
        if ($api.comboboxState !== ComboboxStates.Open) return;
        if ($api.mode === ValueMode.Single) $api.selectActiveOption();
        $api.closeCombobox();
        break;
    }
  }

  function handleChange(e: Event) {
    const target = <HTMLInputElement>e.target;
    dispatch("change", target.value);
  }

  function handleInput(e: Event) {
    const target = <HTMLInputElement>e.target;
    $api.openCombobox();
    dispatch("change", target.value);
  }

  $: propsWeControl = {
    "aria-controls": $optionsRef?.id,
    "aria-expanded": $api.disabled
      ? undefined
      : $api.comboboxState === ComboboxStates.Open,
    "aria-activedescendant":
      $api.activeOptionIndex === null
        ? undefined
        : $api.options[$api.activeOptionIndex]?.id,
    "aria-multiselectable": $api.mode === ValueMode.Multi ? true : undefined,
    "aria-labelledby": $labelRef?.id ?? $buttonRef?.id,
    id,
    role: "combobox",
    type: $$restProps.type ?? "text",
    tabIndex: 0,
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
  name={"ComboboxInput"}
  bind:el={$inputRef}
  on:input={handleInput}
  on:keydown={handleKeyDown}
  on:change={handleChange}
  features={Features.RenderStrategy | Features.Static}
>
  <slot {...slotProps} />
</Render>
