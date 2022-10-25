<script lang="ts" context="module">
  export enum ComboboxStates {
    Open,
    Closed,
  }

  export enum ValueMode {
    Single,
    Multi,
  }

  export enum ActivationTrigger {
    Pointer,
    Other,
  }

  export type ComboboxOptionData = {
    disabled: boolean;
    value: Writable<unknown>;
    domRef: Writable<HTMLElement | null>;
  };

  type StateDefinition = {
    // State
    comboboxState: ComboboxStates;
    value: unknown;

    mode: ValueMode;
    nullable: boolean;

    compare: (a: unknown, z: unknown) => boolean;

    optionsPropsRef: Writable<{ static: boolean; hold: boolean }>;

    labelRef: Writable<HTMLLabelElement | null>;
    inputRef: Writable<HTMLInputElement | null>;
    buttonRef: Writable<HTMLButtonElement | null>;
    optionsRef: Writable<HTMLDivElement | null>;

    disabled: boolean;
    options: { id: string; dataRef: ComboboxOptionData }[];
    activeOptionIndex: number | null;
    activationTrigger: ActivationTrigger;

    // State mutators
    closeCombobox(): void;
    openCombobox(): void;
    goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger): void;
    change(value: unknown): void;
    selectOption(id: string): void;
    selectActiveOption(): void;
    registerOption(id: string, dataRef: ComboboxOptionData): void;
    unregisterOption(id: string): void;
    //select(value: unknown): void;
  };

  const COMBOBOX_CONTEXT_NAME = "headlessui-combobox-context";

  export function useComboboxContext(
    component: string
  ): Readable<StateDefinition> {
    let context: Writable<StateDefinition> | undefined = getContext(
      COMBOBOX_CONTEXT_NAME
    );

    if (context === undefined) {
      throw new Error(
        `<${component} /> is missing a parent <Combobox /> component.`
      );
    }

    return context;
  }

  export function defaultComparator<T>(a: T, z: T): boolean {
    return a === z;
  }

  type TComboboxProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {
    /** Whether the entire `Combobox` and its children should be disabled */
    disabled?: boolean;
    /** The selected value */
    value?: StateDefinition["value"];
    /** The default value when using as an uncontrolled component. */
    defaultValue?: StateDefinition["value"];
    /** The name used when using this component inside a form. */
    name?: string;
    /** Use this to compare objects by a particular field, or pass your own comparison function for complete control over how objects are compared. */
    by?: string | Function;
    /** Whether you can clear the combobox or not. */
    nullable?: boolean;
    /** Whether multiple options can be selected or not. */
    multiple?: boolean;
  };
</script>

<script lang="ts">
  import { get, writable, type Readable, type Writable } from "svelte/store";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { useControllable } from "$lib/hooks/use-controllable";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import Hidden, { Features as HiddenFeatures } from "$lib/internal/Hidden.svelte";
  import { State, useOpenClosedProvider } from "$lib/internal/open-closed";
  import type { TPassThroughProps } from "$lib/types";
  import { calculateActiveIndex, Focus } from "$lib/utils/calculate-active-index";
  import { sortByDomNode } from "$lib/utils/focus-management";
  import { objectToFormEntries } from "$lib/utils/form";
  import { match } from "$lib/utils/match";
  import Render from "$lib/utils/Render.svelte";
  import { getContext } from "svelte";
  import {
    createEventDispatcher,
    get_current_component,
    setContext
  } from "svelte/internal";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TComboboxProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];
  export let by: string | Function = defaultComparator;
  export let value: StateDefinition["value"];
  export let defaultValue: unknown | null = null;
  export let name: string | null = null;
  export let nullable: StateDefinition["nullable"] = false;
  export let multiple: boolean = false;
  export let disabled = false;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "change",
  ]);

  const dispatch = createEventDispatcher<{
    change: any;
  }>();

  /***** Component *****/
  let comboboxState: StateDefinition["comboboxState"] = ComboboxStates.Closed;
  let labelRef: StateDefinition["labelRef"] = writable(null);
  let inputRef: StateDefinition["inputRef"] = writable(null);
  let buttonRef: StateDefinition["buttonRef"] = writable(null);
  let optionsRef: StateDefinition["optionsRef"] = writable(null);
  let optionsPropsRef: StateDefinition["optionsPropsRef"] = writable({
    static: false,
    hold: false,
  });
  let options: StateDefinition["options"] = [];
  let activeOptionIndex: StateDefinition["activeOptionIndex"] = null;
  let activationTrigger: StateDefinition["activationTrigger"] =
    ActivationTrigger.Other;
  let mode: StateDefinition["mode"] = multiple
    ? ValueMode.Multi
    : ValueMode.Single;
  let defaultToFirstOption = false;

  function adjustOrderedState(
      adjustment: (
        options: StateDefinition['options']
      ) => StateDefinition['options'] = (i) => i
    ) {      
      let currentActiveOption =
        activeOptionIndex !== null ? options[activeOptionIndex] : null

      let sortedOptions = sortByDomNode(adjustment(options.slice()), (option) => {
        return get(option.dataRef.domRef)
    })

      // If we inserted an option before the current active option then the active option index
      // would be wrong. To fix this, we will re-lookup the correct index.
      let adjustedActiveOptionIndex = currentActiveOption
        ? sortedOptions.indexOf(currentActiveOption)
        : null

      // Reset to `null` in case the currentActiveOption was removed.
      if (adjustedActiveOptionIndex === -1) {
        adjustedActiveOptionIndex = null
      }
      
      return {
        options: sortedOptions,
        activeOptionIndex: adjustedActiveOptionIndex,
      }
    }

    // Reactive activeOptionIndex
    $: {
      if (
        defaultToFirstOption &&
        activeOptionIndex === null &&
        options.length > 0
      ) {
        let localActiveOptionIndex = options.findIndex(
          (option) => !option.dataRef.disabled
        );
        if (localActiveOptionIndex !== -1) {
          activeOptionIndex = localActiveOptionIndex;
        }
      }

      activeOptionIndex = activeOptionIndex
    }

  let [controlledValue, theirOnChange] = useControllable<any>(
    value,
    (value: unknown) => {          
      dispatch("change", value)            
    },
    defaultValue
  )

  $: value = $controlledValue

  let api = writable<StateDefinition>({
    comboboxState,
    value,
    mode,
    compare(a: any, z: any) {
      if (typeof by === "string") {
        let property = by as unknown as any;
        return a?.[property] === z?.[property];
      }
      return by(a, z);
    },
    nullable,
    inputRef,
    labelRef,
    buttonRef,
    optionsRef,
    disabled: disabled,
    options,
    change(value: unknown) {       
      //dispatch("change", value);
      theirOnChange(value)
    },
    activeOptionIndex,    
    activationTrigger,
    optionsPropsRef,
    closeCombobox() {
      defaultToFirstOption = false;

      if (disabled) return;
      if (comboboxState === ComboboxStates.Closed) return;
      comboboxState = ComboboxStates.Closed;
      activeOptionIndex = null;
    },
    openCombobox() {
      defaultToFirstOption = true;

      if (disabled) return;
      if (comboboxState === ComboboxStates.Open) return;  
      
      // Check if we have a selected value that we can make active.
      let optionIdx = options.findIndex((option) => {
        let optionValue = get(option.dataRef.value);
        let selected = match(mode, {
          [ValueMode.Single]: () => $api.compare($api.value, optionValue),
          [ValueMode.Multi]: () =>
            ($api.value as unknown[]).some((value) =>
              $api.compare(value, optionValue)
            ),
        });

        return selected;
      });      

      if (optionIdx !== -1) {
        activeOptionIndex = optionIdx;
      }

      comboboxState = ComboboxStates.Open;
    },
    goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger) {
      defaultToFirstOption = false;

      if (disabled) return;
      if (
        optionsRef &&
        !$optionsPropsRef.static &&
        comboboxState === ComboboxStates.Closed
      ) {
        return;
      }

      let adjustedState = adjustOrderedState();

      // It's possible that the activeOptionIndex is set to `null` internally, but
      // this means that we will fallback to the first non-disabled option by default.
      // We have to take this into account.
      if (adjustedState.activeOptionIndex === null) {
        let localActiveOptionIndex = adjustedState.options.findIndex(
          (option) => !option.dataRef.disabled
        );

        if (localActiveOptionIndex !== -1) {
          adjustedState.activeOptionIndex = localActiveOptionIndex;
        }
      }

      let nextActiveOptionIndex = calculateActiveIndex(
        focus === Focus.Specific
          ? { focus: Focus.Specific, id: id! }
          : { focus: focus as Exclude<Focus, Focus.Specific> },
        {
          resolveItems: () => adjustedState.options,
          resolveActiveIndex: () => adjustedState.activeOptionIndex,
          resolveId: (option) => option.id,
          resolveDisabled: (option) => option.dataRef.disabled,
        }
      );

      activeOptionIndex = nextActiveOptionIndex;
      activationTrigger = trigger ?? ActivationTrigger.Other;
      options = adjustedState.options;
    },
    selectOption(id: string) {         
      let option = options.find((item) => item.id === id);
      if (!option) return;

      
      let { dataRef } = option;
      theirOnChange(        
        match(mode, {
          [ValueMode.Single]: () => {             
            return get(dataRef.value);
          },
          [ValueMode.Multi]: () => {
            let copy = ($api.value as unknown[]).slice();
            let raw = get(dataRef.value);

            let idx = copy.findIndex((value) => $api.compare(raw, value))            
            if (idx === -1) {
              copy.push(raw);
            } else {
              copy.splice(idx, 1);
            }            
            return copy;
          },
        })
      );      
    },
    selectActiveOption() {
      if ($api.activeOptionIndex === null) return;

      let { dataRef, id } = options[$api.activeOptionIndex];
      theirOnChange(        
        match(mode, {
          [ValueMode.Single]: () => get(dataRef.value),
          [ValueMode.Multi]: () => {
            let copy = ($api.value as unknown[]).slice();
            let raw = get(dataRef.value);

            let idx = copy.findIndex((value) => $api.compare(raw, value))            
            if (idx === -1) {
              copy.push(raw);
            } else {
              copy.splice(idx, 1);
            }

            return copy;
          },
        })
      );

      // It could happen that the `activeOptionIndex` stored in state is actually null,
      // but we are getting the fallback active option back instead.
      $api.goToOption(Focus.Specific, id);
    },
    registerOption(id: string, dataRef: ComboboxOptionData) {
      let option = { id, dataRef };
      let adjustedState = adjustOrderedState((options) => [...options, option]);
      
      // Check if we have a selected value that we can make active.
      if (activeOptionIndex === null) {
        let optionValue = get(dataRef.value);        

        let selected = match(mode, {
          [ValueMode.Single]: () => $api.compare($api.value, optionValue),
          [ValueMode.Multi]: () =>
            ($api.value as unknown[]).some((value) =>
              $api.compare(value, optionValue)
            ),
        });

        if (selected) {
          adjustedState.activeOptionIndex =
            adjustedState.options.indexOf(option);
        }
      }

      options = adjustedState.options;
      activeOptionIndex = adjustedState.activeOptionIndex;
      activationTrigger = ActivationTrigger.Other;
    },
    unregisterOption(id: string) {
      let adjustedState = adjustOrderedState((options) => {
        let idx = options.findIndex((a) => a.id === id);
        if (idx !== -1) options.splice(idx, 1);
        return options;
      });

      options = adjustedState.options;
      activeOptionIndex = adjustedState.activeOptionIndex;
      activationTrigger = ActivationTrigger.Other;
    },
  });
  setContext(COMBOBOX_CONTEXT_NAME, api);

  // Handle outside click
  // useOutsideClick(
  //     [inputRef, buttonRef, optionsRef],
  //     () => api.closeCombobox(),
  //     computed(() => comboboxState.value === ComboboxStates.Open)
  //   )

  function handleMousedown(event: MouseEvent) {
    let target = event.target as HTMLElement;
    let active = document.activeElement;

    if (comboboxState !== ComboboxStates.Open) return;
    if ($buttonRef?.contains(target)) return;
    if ($inputRef?.contains(target)) return
    if (!$optionsRef?.contains(target)) $api.closeCombobox();

    if (active !== document.body && active?.contains(target)) return; // Keep focus on newly clicked/focused element
    
    if (!event.defaultPrevented) {
      $inputRef?.focus({ preventScroll: true });
    }
  }

  function computeOpenClosedState(comboboxState: ComboboxStates) {
    return match(comboboxState, {
      [ComboboxStates.Open]: State.Open,
      [ComboboxStates.Closed]: State.Closed,
    });
  }

  let openClosedState = writable<State>(
    computeOpenClosedState(comboboxState)
  );

  useOpenClosedProvider(openClosedState);
  $: $openClosedState = computeOpenClosedState(comboboxState);

  $: activeOption =
    $api.activeOptionIndex === null
      ? null
      : (options[$api.activeOptionIndex]?.dataRef as any);  

  $: api.update((obj) => {
    return {
      ...obj,
      comboboxState,
      value,
      options,
      activeOptionIndex,
      disabled,
    };
  });
  
  $: slotProps = {
    open: comboboxState === ComboboxStates.Open,
    disabled,
    activeIndex: $api.activeOptionIndex,
    activeOption: activeOption,
    value,
  };
</script>

<svelte:window on:mousedown={handleMousedown} />

{#if name != null && value != null}
  {@const options = objectToFormEntries({ [name]: value })}
  {#each options as [optionName, optionValue], index (index)}        
    <Hidden
      features={HiddenFeatures.Hidden}
      as="input"
      type="hidden"
      hidden
      readonly
      name={optionName}
      value={optionValue}
    />
  {/each}
{/if}  
<Render
  {...$$restProps}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"Combobox"}
>
  <slot {...slotProps} />
</Render>