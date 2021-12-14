<script lang="ts" context="module">
  import {
    Focus,
    calculateActiveIndex,
  } from "$lib/utils/calculate-active-index";
  import { getContext, setContext } from "svelte";
  import { writable, Writable } from "svelte/store";
  import { State } from "$lib/internal/open-closed";
  import { match } from "$lib/utils/match";
  export enum MenuStates {
    Open,
    Closed,
  }
  export type MenuItemData = { textValue: string; disabled: boolean };
  export type StateDefinition = {
    // State
    menuState: MenuStates;
    buttonStore: Writable<HTMLButtonElement | null>;
    itemsStore: Writable<HTMLDivElement | null>;
    items: { id: string; data: MenuItemData }[];
    searchQuery: string;
    activeItemIndex: number | null;

    // State mutators
    closeMenu(): void;
    openMenu(): void;
    goToItem(focus: Focus, id?: string): void;
    search(value: string): void;
    clearSearch(): void;
    registerItem(id: string, dataRef: MenuItemData): void;
    unregisterItem(id: string): void;
  };

  const MENU_CONTEXT_NAME = "MenuContext";

  export function useMenuContext(
    componentName: string
  ): Writable<StateDefinition | undefined> {
    let context: Writable<StateDefinition | undefined> | undefined =
      getContext(MENU_CONTEXT_NAME);

    if (context === undefined) {
      throw new Error(
        `<${componentName} /> is missing a parent <Menu /> component.`
      );
    }
    return context;
  }
</script>

<script lang="ts">
  let menuState: StateDefinition["menuState"] = MenuStates.Closed;
  let buttonStore: StateDefinition["buttonStore"] = writable(null);
  let itemsStore: StateDefinition["itemsStore"] = writable(null);
  let items: StateDefinition["items"] = [];
  let searchQuery: StateDefinition["searchQuery"] = "";
  let activeItemIndex: StateDefinition["activeItemIndex"] = null;

  let api: Writable<StateDefinition | undefined> = writable();
  setContext(MENU_CONTEXT_NAME, api);

  $: api.set({
    menuState,
    buttonStore,
    itemsStore: itemsStore,
    items,
    searchQuery,
    activeItemIndex,
    closeMenu: () => {
      menuState = MenuStates.Closed;
      activeItemIndex = null;
    },
    openMenu: () => (menuState = MenuStates.Open),
    goToItem(focus: Focus, id?: string) {
      let nextActiveItemIndex = calculateActiveIndex(
        focus === Focus.Specific
          ? { focus: Focus.Specific, id: id! }
          : { focus: focus as Exclude<Focus, Focus.Specific> },
        {
          resolveItems: () => items,
          resolveActiveIndex: () => activeItemIndex,
          resolveId: (item) => item.id,
          resolveDisabled: (item) => item.data.disabled,
        }
      );

      if (searchQuery === "" && activeItemIndex === nextActiveItemIndex) return;
      searchQuery = "";
      activeItemIndex = nextActiveItemIndex;
    },
    search(value: string) {
      searchQuery += value.toLowerCase();

      let match = items.findIndex(
        (item) =>
          item.data.textValue.startsWith(searchQuery) && !item.data.disabled
      );

      if (match === -1 || match === activeItemIndex) return;

      activeItemIndex = match;
    },
    clearSearch() {
      searchQuery = "";
    },
    registerItem(id: string, data: MenuItemData) {
      items.push({ id, data });
    },
    unregisterItem(id: string) {
      let nextItems = items.slice();
      let currentActiveItem =
        activeItemIndex !== null ? nextItems[activeItemIndex] : null;
      let idx = nextItems.findIndex((a) => a.id === id);
      if (idx !== -1) nextItems.splice(idx, 1);
      items = nextItems;
      activeItemIndex = (() => {
        if (idx === activeItemIndex) return null;
        if (currentActiveItem === null) return null;

        // If we removed the item before the actual active index, then it would be out of sync. To
        // fix this, we will find the correct (new) index position.
        return nextItems.indexOf(currentActiveItem);
      })();
    },
  });

  function handleWindowMousedown(event: MouseEvent): void {
    let target = event.target as HTMLElement;
    let active = document.activeElement;

    if (menuState !== MenuStates.Open) return;
    if ($buttonStore?.contains(target)) return;

    if (!$itemsStore?.contains(target)) $api.closeMenu();
    if (active !== document.body && active?.contains(target)) return; // Keep focus on newly clicked/focused element
    if (!event.defaultPrevented) $buttonStore?.focus({ preventScroll: true });
  }

  let openClosedState: Writable<State> | undefined = writable();
  setContext("OpenClosed", openClosedState);

  $: $openClosedState = match(menuState, {
    [MenuStates.Open]: State.Open,
    [MenuStates.Closed]: State.Closed,
  });
</script>

<svelte:window on:mousedown={handleWindowMousedown} />
<div {...$$restProps}>
  <slot />
</div>
