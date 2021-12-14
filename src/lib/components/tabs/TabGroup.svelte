<script lang="ts" context="module">
  import {
    createEventDispatcher,
    getContext,
    onMount,
    setContext,
  } from "svelte";

  import { writable, Writable } from "svelte/store";

  export type StateDefinition = {
    // State
    selectedIndex: number | null;
    orientation: "vertical" | "horizontal";
    activation: "auto" | "manual";

    tabs: (HTMLElement | null)[];
    panels: (HTMLElement | null)[];

    // State mutators
    setSelectedIndex(index: number): void;
    registerTab(tab: HTMLElement | null): void;
    unregisterTab(tab: HTMLElement | null): void;
    registerPanel(panel: HTMLElement | null): void;
    unregisterPanel(panel: HTMLElement | null): void;
  };

  const TABS_CONTEXT_NAME = "TabsContext";

  export function useTabsContext(
    component: string
  ): Writable<StateDefinition | undefined> {
    let context: Writable<StateDefinition | undefined> | undefined =
      getContext(TABS_CONTEXT_NAME);

    if (context === undefined) {
      throw new Error(
        `<${component} /> is missing a parent <TabGroup /> component.`
      );
    }

    return context;
  }
</script>

<script lang="ts">
  export let defaultIndex = 0;
  export let vertical = false;
  export let manual = false;

  let selectedIndex: StateDefinition["selectedIndex"] = null;
  let tabs: StateDefinition["tabs"] = [];
  let panels: StateDefinition["panels"] = [];

  const dispatch = createEventDispatcher();

  let api: Writable<StateDefinition | undefined> = writable();
  setContext(TABS_CONTEXT_NAME, api);

  $: api.set({
    selectedIndex,
    orientation: vertical ? "vertical" : "horizontal",
    activation: manual ? "manual" : "auto",
    tabs,
    panels,
    setSelectedIndex(index: number) {
      if (selectedIndex === index) return;
      selectedIndex = index;
      dispatch("updateValue", index);
    },
    registerTab(tab: typeof tabs[number]) {
      if (!tabs.includes(tab)) tabs = [...tabs, tab];
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

  onMount(() => {
    if ($api.tabs.length <= 0) return;
    if (selectedIndex !== null) return;

    let tabs = $api.tabs.filter(Boolean) as HTMLElement[];
    let focusableTabs = tabs.filter((tab) => !tab.hasAttribute("disabled"));
    if (focusableTabs.length <= 0) return;

    // Underflow
    if (defaultIndex < 0) {
      selectedIndex = tabs.indexOf(focusableTabs[0]);
    }

    // Overflow
    else if (defaultIndex > $api.tabs.length) {
      selectedIndex = tabs.indexOf(focusableTabs[focusableTabs.length - 1]);
    }

    // Middle
    else {
      let before = tabs.slice(0, defaultIndex);
      let after = tabs.slice(defaultIndex);

      let next = [...after, ...before].find((tab) =>
        focusableTabs.includes(tab)
      );
      if (!next) return;

      selectedIndex = tabs.indexOf(next);
    }
  });
</script>

<div {...$$restProps}>
  <slot {selectedIndex} />
</div>
