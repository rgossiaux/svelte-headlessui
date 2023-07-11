<script lang="ts" context="module">
  export enum ListboxStates {
    Open,
    Closed,
  }
  export type ListboxOptionDataRef = {
    textValue: string;
    disabled: boolean;
    value: unknown;
  };

  export type StateDefinition = {
    // State
    listboxState: ListboxStates;
    value: unknown;
    orientation: "vertical" | "horizontal";

    labelRef: Writable<HTMLLabelElement | null>;
    buttonRef: Writable<HTMLButtonElement | null>;
    optionsRef: Writable<HTMLElement | null>;

    disabled: boolean;
    options: { id: string; dataRef: ListboxOptionDataRef }[];
    searchQuery: string;
    activeOptionIndex: number | null;

    // State mutators
    closeListbox(): void;
    openListbox(): void;
    goToOption(focus: Focus, id?: string): void;
    search(value: string): void;
    clearSearch(): void;
    registerOption(id: string, dataRef: ListboxOptionDataRef): void;
    unregisterOption(id: string): void;
    select(newValue: unknown): void;
  };

  const LISTBOX_CONTEXT_NAME = "headlessui-listbox-context";
  export function useListboxContext(
    component: string
  ): Readable<StateDefinition> {
    let context: Writable<StateDefinition> | undefined =
      getContext(LISTBOX_CONTEXT_NAME);

    if (context === undefined) {
      throw new Error(
        `<${component} /> is missing a parent <Listbox /> component.`
      );
    }

    return context;
  }

  type TListboxProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {
    /** Whether the entire `Listbox` and its children should be disabled */
    disabled?: boolean;
    /** Whether the entire `Listbox` should be oriented horizontally instead of vertically */
    horizontal?: boolean;
    /** The selected value */
    value: StateDefinition["value"];
  };
</script>

<script lang="ts">
  import {
    Focus,
    calculateActiveIndex,
  } from "$lib/utils/calculate-active-index";
  import { getContext, setContext } from "svelte";
  import type { Readable, Writable } from "svelte/store";
  import { writable } from "svelte/store";
  import { match } from "$lib/utils/match";
  import { State, useOpenClosedProvider } from "$lib/internal/open-closed";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TListboxProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];
  export let disabled = false;
  export let horizontal = false;
  export let value: StateDefinition["value"];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  $: orientation = (
    horizontal ? "horizontal" : "vertical"
  ) as StateDefinition["orientation"];

  let listboxState: StateDefinition["listboxState"] = ListboxStates.Closed;
  let labelRef: StateDefinition["labelRef"] = writable(null);
  let buttonRef: StateDefinition["buttonRef"] = writable(null);
  let optionsRef: StateDefinition["optionsRef"] = writable(null);
  let options: StateDefinition["options"] = [];
  let searchQuery: StateDefinition["searchQuery"] = "";
  let activeOptionIndex: StateDefinition["activeOptionIndex"] = null;

  let api = writable<StateDefinition>({
    listboxState,
    value,
    labelRef,
    buttonRef,
    optionsRef,
    options,
    searchQuery,
    activeOptionIndex,
    disabled,
    orientation,
    closeListbox() {
      if (disabled) return;
      if (listboxState === ListboxStates.Closed) return;
      listboxState = ListboxStates.Closed;
      activeOptionIndex = null;
    },
    openListbox() {
      if (disabled) return;
      if (listboxState === ListboxStates.Open) return;
      listboxState = ListboxStates.Open;
    },
    goToOption(focus: Focus, id?: string) {
      if (disabled) return;
      if (listboxState === ListboxStates.Closed) return;

      let nextActiveOptionIndex = calculateActiveIndex(
        focus === Focus.Specific
          ? { focus: Focus.Specific, id: id! }
          : { focus: focus as Exclude<Focus, Focus.Specific> },
        {
          resolveItems: () => options,
          resolveActiveIndex: () => activeOptionIndex,
          resolveId: (option) => option.id,
          resolveDisabled: (option) => option.dataRef.disabled,
        }
      );

      if (searchQuery === "" && activeOptionIndex === nextActiveOptionIndex)
        return;
      activeOptionIndex = nextActiveOptionIndex;
      searchQuery = "";
    },
    search(value: string) {
      if (disabled) return;
      if (listboxState === ListboxStates.Closed) return;

      searchQuery += value.toLowerCase();

      let reorderedOptions =
        activeOptionIndex !== null
          ? options
              .slice(activeOptionIndex + 1)
              .concat(options.slice(0, activeOptionIndex + 1))
          : options;

      let matchingOption = reorderedOptions.find(
        (option) =>
          !option.dataRef.disabled &&
          option.dataRef.textValue.startsWith(searchQuery)
      );

      let matchIdx = matchingOption ? options.indexOf(matchingOption) : -1;
      if (matchIdx === -1 || matchIdx === activeOptionIndex) return;
      activeOptionIndex = matchIdx;
    },
    clearSearch() {
      if (disabled) return;
      if (listboxState === ListboxStates.Closed) return;
      if (searchQuery === "") return;

      searchQuery = "";
    },
    registerOption(id: string, dataRef) {
      if (!$optionsRef) {
        // We haven't mounted yet so just append
        options = [...options, { id, dataRef }];
        return;
      }
      let currentActiveOption =
        activeOptionIndex !== null ? options[activeOptionIndex] : null;

      let orderMap = Array.from(
        $optionsRef.querySelectorAll('[id^="headlessui-listbox-option-"]')!
      ).reduce(
        (lookup, element, index) =>
          Object.assign(lookup, { [element.id]: index }),
        {}
      ) as Record<string, number>;

      let nextOptions = [...options, { id, dataRef }];
      nextOptions.sort((a, z) => orderMap[a.id] - orderMap[z.id]);
      options = nextOptions;

      // Maintain the correct item active
      activeOptionIndex = (() => {
        if (currentActiveOption === null) return null;
        return options.indexOf(currentActiveOption);
      })();
    },
    unregisterOption(id: string) {
      let nextOptions = options.slice();
      let currentActiveOption =
        activeOptionIndex !== null ? nextOptions[activeOptionIndex] : null;
      let idx = nextOptions.findIndex((a) => a.id === id);
      if (idx !== -1) nextOptions.splice(idx, 1);
      options = nextOptions;
      activeOptionIndex = (() => {
        if (idx === activeOptionIndex) return null;
        if (currentActiveOption === null) return null;

        // If we removed the option before the actual active index, then it would be out of sync. To
        // fix this, we will find the correct (new) index position.
        return nextOptions.indexOf(currentActiveOption);
      })();
    },
    select(newValue: unknown) {
      if (disabled) return;
      value = newValue;
    },
  });
  setContext(LISTBOX_CONTEXT_NAME, api);

  let openClosedState = writable(State.Closed);
  useOpenClosedProvider(openClosedState);

  $: openClosedState.set(
    match(listboxState, {
      [ListboxStates.Open]: State.Open,
      [ListboxStates.Closed]: State.Closed,
    })
  );

  $: api.update((obj) => {
    return {
      ...obj,
      listboxState,
      value,
      options,
      searchQuery,
      activeOptionIndex,
      disabled,
      orientation,
    };
  });

  function handleMousedown(event: MouseEvent) {
    let target = event.target as HTMLElement;
    let active = document.activeElement;

    if (listboxState !== ListboxStates.Open) return;
    if ($buttonRef?.contains(target)) return;

    if (!$optionsRef?.contains(target)) $api.closeListbox();
    if (active !== document.body && active?.contains(target)) return; // Keep focus on newly clicked/focused element
    if (!event.defaultPrevented) {
      $buttonRef?.focus({ preventScroll: true });
    }
  }
  $: slotProps = { open: listboxState === ListboxStates.Open };
</script>

<svelte:window on:mousedown={handleMousedown} />
<Render
  {...$$restProps}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"Listbox"}
>
  <slot {...slotProps} />
</Render>
