<script lang="ts" context="module">
  import {
    Focus,
    calculateActiveIndex,
  } from "$lib/utils/calculate-active-index";
  import { getContext, setContext } from "svelte";
  import type { Readable, Writable } from "svelte/store";
  import { writable } from "svelte/store";
  import { State, useOpenClosedProvider } from "$lib/internal/open-closed";
  import { match } from "$lib/utils/match";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import Render from "$lib/utils/Render.svelte";
  import type { TPassThroughProps } from "$lib/types";

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

  const MENU_CONTEXT_NAME = "headlessui-menu-context";

  export function useMenuContext(
    componentName: string
  ): Readable<StateDefinition> {
    let context: Writable<StateDefinition> | undefined =
      getContext(MENU_CONTEXT_NAME);

    if (context === undefined) {
      throw new Error(
        `<${componentName} /> is missing a parent <Menu /> component.`
      );
    }
    return context;
  }

  type TMenuProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {};
</script>

<script lang="ts">
  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TMenuProps<typeof slotProps, TAsProp>;

  export let use: HTMLActionArray = [];
  export let as: SupportedAs = "div";

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let menuState: StateDefinition["menuState"] = MenuStates.Closed;
  let buttonStore: StateDefinition["buttonStore"] = writable(null);
  let itemsStore: StateDefinition["itemsStore"] = writable(null);
  let items: StateDefinition["items"] = [];
  let searchQuery: StateDefinition["searchQuery"] = "";
  let activeItemIndex: StateDefinition["activeItemIndex"] = null;

  let api = writable<StateDefinition>({
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

      let reorderedItems =
        activeItemIndex !== null
          ? items
              .slice(activeItemIndex + 1)
              .concat(items.slice(0, activeItemIndex + 1))
          : items;

      let matchingItem = reorderedItems.find(
        (item) =>
          item.data.textValue.startsWith(searchQuery) && !item.data.disabled
      );

      let matchIdx = matchingItem ? items.indexOf(matchingItem) : -1;
      if (matchIdx === -1 || matchIdx === activeItemIndex) return;

      activeItemIndex = matchIdx;
    },
    clearSearch() {
      searchQuery = "";
    },
    registerItem(id: string, data: MenuItemData) {
      if (!$itemsStore) {
        // We haven't mounted yet so just append
        items = [...items, { id, data }];
        return;
      }
      let currentActiveItem =
        activeItemIndex !== null ? items[activeItemIndex] : null;

      let orderMap = Array.from(
        $itemsStore.querySelectorAll('[id^="headlessui-menu-item-"]')!
      ).reduce(
        (lookup, element, index) =>
          Object.assign(lookup, { [element.id]: index }),
        {}
      ) as Record<string, number>;

      let nextItems = [...items, { id, data }];
      nextItems.sort((a, z) => orderMap[a.id] - orderMap[z.id]);
      items = nextItems;

      // Maintain the correct item active
      activeItemIndex = (() => {
        if (currentActiveItem === null) return null;
        return items.indexOf(currentActiveItem);
      })();
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
  setContext(MENU_CONTEXT_NAME, api);

  $: api.update((obj) => {
    return {
      ...obj,
      menuState,
      buttonStore,
      itemsStore,
      items,
      searchQuery,
      activeItemIndex,
    };
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

  let openClosedState = writable<State>(State.Closed);
  useOpenClosedProvider(openClosedState);

  $: $openClosedState = match(menuState, {
    [MenuStates.Open]: State.Open,
    [MenuStates.Closed]: State.Closed,
  });

  $: slotProps = { open: menuState === MenuStates.Open };
</script>

<svelte:window on:mousedown={handleWindowMousedown} />
<Render
  {...$$restProps}
  use={[...use, forwardEvents]}
  {as}
  {slotProps}
  name={"Menu"}
>
  <slot {...slotProps} />
</Render>
