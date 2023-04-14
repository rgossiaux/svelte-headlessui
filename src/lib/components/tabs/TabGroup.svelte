<script lang="ts" context="module">
  interface PanelData {
    id: string;
    ref: Readable<HTMLElement | null>;
  }
  export type StateDefinition = {
    // State
    selectedIndex: number | null;
    orientation: "vertical" | "horizontal";
    activation: "auto" | "manual";

    tabs: HTMLElement[];
    panels: PanelData[];

    listRef: Writable<HTMLElement | null>;

    // State mutators
    setSelectedIndex(index: number): void;
    registerTab(tab: HTMLElement | null): void;
    unregisterTab(tab: HTMLElement | null): void;
    registerPanel(panel: PanelData): void;
    unregisterPanel(panel: PanelData): void;
  };

  const TABS_CONTEXT_NAME = "headlessui-tabs-context";

  export function useTabsContext(component: string): Readable<StateDefinition> {
    let context: Writable<StateDefinition> | undefined =
      getContext(TABS_CONTEXT_NAME);

    if (context === undefined) {
      throw new Error(
        `<${component} /> is missing a parent <TabGroup /> component.`
      );
    }

    return context;
  }

  type TTabGroupProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {
    /** The index of the default selected tab */
    defaultIndex?: number;
    /** Whether the orientation of the `TabList` is vertical instead of horizontal */
    vertical?: boolean;
    /**
     * Whether, in keyboard navigation, the Enter or Space key is necessary to change tabs.
     * By default, the arrow keys will change tabs automatically without hitting Enter/Space.
     * This has no impact on mouse behavior
     */
    manual?: boolean;
  };
</script>

<script lang="ts">
  import {
    createEventDispatcher,
    getContext,
    onMount,
    setContext,
  } from "svelte";

  import type { Readable, Writable } from "svelte/store";
  import { writable } from "svelte/store";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TTabGroupProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];
  export let defaultIndex = 0;
  export let vertical = false;
  export let manual = false;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "change",
  ]);
  const dispatch = createEventDispatcher();

  /***** Component *****/
  let selectedIndex: StateDefinition["selectedIndex"] = null;
  let tabs: StateDefinition["tabs"] = [];
  let panels: StateDefinition["panels"] = [];
  let listRef: StateDefinition["listRef"] = writable(null);

  let api = writable<StateDefinition>({
    selectedIndex,
    orientation: vertical ? "vertical" : "horizontal",
    activation: manual ? "manual" : "auto",
    tabs,
    panels,
    listRef,
    setSelectedIndex(index: number) {
      if (selectedIndex === index) return;
      selectedIndex = index;
      dispatch("change", index);
    },
    registerTab(tab: typeof tabs[number]) {
      if (tabs.includes(tab)) return;
      if (!$listRef) {
        // We haven't mounted yet so just append
        tabs = [...tabs, tab];
        return;
      }
      let currentSelectedTab =
        selectedIndex !== null ? tabs[selectedIndex] : null;

      let orderMap = Array.from(
        $listRef.querySelectorAll('[id^="headlessui-tabs-tab-"]')!
      ).reduce(
        (lookup, element, index) =>
          Object.assign(lookup, { [element.id]: index }),
        {}
      ) as Record<string, number>;

      let nextTabs = [...tabs, tab];
      nextTabs.sort((a, z) => orderMap[a.id] - orderMap[z.id]);
      tabs = nextTabs;

      // Maintain the correct item active
      selectedIndex = (() => {
        if (currentSelectedTab === null) return null;
        return tabs.indexOf(currentSelectedTab);
      })();
    },
    unregisterTab(tab: typeof tabs[number]) {
      tabs = tabs.filter((t) => t !== tab);
    },
    registerPanel(panel: typeof panels[number]) {
      if (!panels.includes(panel)) panels = [...panels, panel];
    },
    unregisterPanel(panel: typeof panels[number]) {
      panels = panels.filter((p) => p !== panel);
    },
  });
  setContext(TABS_CONTEXT_NAME, api);

  $: api.update((obj) => {
    return {
      ...obj,
      selectedIndex,
      orientation: vertical ? "vertical" : "horizontal",
      activation: manual ? "manual" : "auto",
      tabs,
      panels,
    };
  });

  onMount(() => {
    if (tabs.length <= 0) return;
    if (selectedIndex !== null) return;

    let mountedTabs = tabs.filter(Boolean) as HTMLElement[];
    let focusableTabs = mountedTabs.filter(
      (tab) => !tab.hasAttribute("disabled")
    );
    if (focusableTabs.length <= 0) return;

    // Underflow
    if (defaultIndex < 0) {
      selectedIndex = mountedTabs.indexOf(focusableTabs[0]);
    }

    // Overflow
    else if (defaultIndex > mountedTabs.length) {
      selectedIndex = mountedTabs.indexOf(
        focusableTabs[focusableTabs.length - 1]
      );
    }

    // Middle
    else {
      let before = mountedTabs.slice(0, defaultIndex);
      let after = mountedTabs.slice(defaultIndex);

      let next = [...after, ...before].find((tab) =>
        focusableTabs.includes(tab)
      );
      if (!next) return;

      selectedIndex = mountedTabs.indexOf(next);
    }
  });

  $: slotProps = { selectedIndex };
</script>

<Render
  {...$$restProps}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"TabGroup"}
>
  <slot {...slotProps} />
</Render>
