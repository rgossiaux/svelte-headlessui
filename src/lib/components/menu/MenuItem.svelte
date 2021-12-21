<script lang="ts">
  import { useMenuContext, MenuStates, MenuItemData } from "./Menu.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Focus } from "$lib/utils/calculate-active-index";
  import { afterUpdate, onDestroy, onMount, tick } from "svelte";
  import Render from "$lib/utils/Render.svelte";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  const forwardEvents = forwardEventsBuilder(get_current_component());
  export let as: SupportedAs = "a";
  export let use: HTMLActionArray = [];
  export let disabled = false;
  const api = useMenuContext("MenuItem");
  const id = `headlessui-menu-item-${useId()}`;

  $: active =
    $api.activeItemIndex !== null
      ? $api.items[$api.activeItemIndex].id === id
      : false;

  $: buttonStore = $api.buttonStore;

  let elementRef: HTMLElement | undefined;
  $: textValue = elementRef?.textContent?.toLowerCase().trim();
  $: data = { disabled, textValue } as MenuItemData;

  onMount(async () => {
    await tick();
    $api.registerItem(id, data);
  });

  onDestroy(() => {
    $api.unregisterItem(id);
  });

  afterUpdate(async () => {
    if ($api.menuState !== MenuStates.Open) return;
    if (!active) return;
    await tick();
    elementRef?.scrollIntoView?.({ block: "nearest" });
  });

  async function handleClick(event: CustomEvent) {
    if (disabled) return event.preventDefault();
    $api.closeMenu();
    $buttonStore?.focus({ preventScroll: true });
  }

  function handleFocus() {
    if (disabled) return $api.goToItem(Focus.Nothing);
    $api.goToItem(Focus.Specific, id);
  }

  function handleMove() {
    if (disabled) return;
    if (active) return;
    $api.goToItem(Focus.Specific, id);
  }

  function handleLeave() {
    if (disabled) return;
    if (!active) return;
    $api.goToItem(Focus.Nothing);
  }

  $: propsWeControl = {
    id,
    role: "menuitem",
    tabIndex: disabled === true ? undefined : -1,
    "aria-disabled": disabled === true ? true : undefined,
  };

  $: slotProps = { active, disabled };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  use={[...use, forwardEvents]}
  {as}
  {slotProps}
  name={"MenuItem"}
  bind:el={elementRef}
  on:click={handleClick}
  on:focus={handleFocus}
  on:pointermove={handleMove}
  on:mousemove={handleMove}
  on:pointerleave={handleLeave}
  on:mouseleave={handleLeave}
>
  <slot {...slotProps} />
</Render>
