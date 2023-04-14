<script lang="ts" context="module">
  type TMenuItemsProps<
    TSlotProp extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProp, TAsProp, "div"> & {
    /** Whether the element should ignore the internally managed open/closed state */
    static?: boolean;
    /** Whether the element should be unmounted, instead of just hidden, based on the open/closed state	*/
    unmount?: boolean;
  };
</script>

<script lang="ts">
  import { useMenuContext, MenuStates } from "./Menu.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Keys } from "$lib/utils/keyboard";
  import { Focus } from "$lib/utils/calculate-active-index";
  import { treeWalker } from "$lib/hooks/use-tree-walker";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import { tick } from "svelte";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import type { SupportedAs } from "$lib/internal/elements";
  import Render from "$lib/utils/Render.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import { Features, type TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TMenuItemsProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  const api = useMenuContext("MenuItems");
  const id = `headlessui-menu-items-${useId()}`;
  let searchDebounce: ReturnType<typeof setTimeout> | null = null;

  $: buttonStore = $api.buttonStore;
  $: itemsStore = $api.itemsStore;

  let openClosedState = useOpenClosed();

  $: visible =
    openClosedState !== undefined
      ? $openClosedState === State.Open
      : $api.menuState === MenuStates.Open;

  $: treeWalker({
    container: $itemsStore,
    enabled: $api.menuState === MenuStates.Open,
    accept(node) {
      if (node.getAttribute("role") === "menuitem")
        return NodeFilter.FILTER_REJECT;
      if (node.hasAttribute("role")) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
    walk(node) {
      node.setAttribute("role", "none");
    },
  });

  async function handleKeyDown(e: CustomEvent) {
    if (searchDebounce) clearTimeout(searchDebounce);
    let event = e as any as KeyboardEvent;

    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

      case Keys.Space:
        if ($api.searchQuery !== "") {
          event.preventDefault();
          event.stopPropagation();
          return $api.search(event.key);
        }
      // When in type ahead mode, fallthrough
      case Keys.Enter:
        event.preventDefault();
        event.stopPropagation();
        if ($api.activeItemIndex !== null) {
          let { id } = $api.items[$api.activeItemIndex];
          document.getElementById(id)?.click();
        }
        $api.closeMenu();
        await tick();
        $buttonStore?.focus({ preventScroll: true });
        break;

      case Keys.ArrowDown:
        event.preventDefault();
        event.stopPropagation();
        return $api.goToItem(Focus.Next);

      case Keys.ArrowUp:
        event.preventDefault();
        event.stopPropagation();
        return $api.goToItem(Focus.Previous);

      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault();
        event.stopPropagation();
        return $api.goToItem(Focus.First);

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault();
        event.stopPropagation();
        return $api.goToItem(Focus.Last);

      case Keys.Escape:
        event.preventDefault();
        event.stopPropagation();
        $api.closeMenu();
        await tick();
        $buttonStore?.focus({ preventScroll: true });
        break;

      case Keys.Tab:
        event.preventDefault();
        event.stopPropagation();
        break;

      default:
        if (event.key.length === 1) {
          $api.search(event.key);
          searchDebounce = setTimeout(() => $api.clearSearch(), 350);
        }
        break;
    }
  }

  function handleKeyUp(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault();
        break;
    }
  }

  $: propsWeControl = {
    "aria-activedescendant":
      $api.activeItemIndex === null
        ? undefined
        : $api.items[$api.activeItemIndex]?.id,
    "aria-labelledby": $buttonStore?.id,
    id,
    role: "menu",
    tabIndex: 0,
  };
  $: slotProps = {
    open: $api.menuState === MenuStates.Open,
  };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  bind:el={$itemsStore}
  name={"MenuItems"}
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
  {visible}
  features={Features.RenderStrategy | Features.Static}
>
  <slot {...slotProps} />
</Render>
