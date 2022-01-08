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
    select(value: unknown): void;
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
</script>

<script lang="ts">
  import {
    Focus,
    calculateActiveIndex,
  } from "$lib/utils/calculate-active-index";
  import { createEventDispatcher, getContext, setContext } from "svelte";
  import { Readable, writable, Writable } from "svelte/store";
  import { match } from "$lib/utils/match";
  import { State, useOpenClosedProvider } from "$lib/internal/open-closed";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "change",
  ]);
  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  export let disabled = false;
  export let horizontal = false;
  export let value: StateDefinition["value"];
  $: orientation = (
    horizontal ? "horizontal" : "vertical"
  ) as StateDefinition["orientation"];

  const dispatch = createEventDispatcher();

  let listboxState: StateDefinition["listboxState"] = ListboxStates.Closed;
  let labelRef: StateDefinition["labelRef"] = writable(null);
  let buttonRef: StateDefinition["buttonRef"] = writable(null);
  let optionsRef: StateDefinition["optionsRef"] = writable(null);
  let options: StateDefinition["options"] = [];
  let searchQuery: StateDefinition["searchQuery"] = "";
  let activeOptionIndex: StateDefinition["activeOptionIndex"] = null;

  let api: Writable<StateDefinition> = writable({
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

      let match = options.findIndex(
        (option) =>
          !option.dataRef.disabled &&
          option.dataRef.textValue.startsWith(searchQuery)
      );

      if (match === -1 || match === activeOptionIndex) return;
      activeOptionIndex = match;
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
    select(nextValue: unknown) {
      if (disabled) return;
      const newValue = Array.isArray(value)
        ? value.includes(nextValue)
          ? value.filter((option) => option !== nextValue)
          : [...value, nextValue]
        : nextValue;
      dispatch("change", newValue);
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
