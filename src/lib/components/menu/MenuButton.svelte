<script lang="ts">
  import { useMenuContext, MenuStates } from "./Menu.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Keys } from "$lib/utils/keyboard";
  import { Focus } from "$lib/utils/calculate-active-index";
  import { tick } from "svelte";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  const forwardEvents = forwardEventsBuilder(get_current_component());
  export let as: SupportedAs = "button";
  export let use: HTMLActionArray = [];

  export let disabled = false;
  const api = useMenuContext("MenuButton");
  const id = `headlessui-menu-button-${useId()}`;

  $: buttonStore = $api.buttonStore;
  $: itemsStore = $api.itemsStore;
  async function handleKeyDown(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

      case Keys.Space:
      case Keys.Enter:
      case Keys.ArrowDown:
        event.preventDefault();
        event.stopPropagation();
        $api.openMenu();
        await tick();
        $itemsStore?.focus({ preventScroll: true });
        $api.goToItem(Focus.First);
        break;

      case Keys.ArrowUp:
        event.preventDefault();
        event.stopPropagation();
        $api.openMenu();
        await tick();
        $itemsStore?.focus({ preventScroll: true });
        $api.goToItem(Focus.Last);
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

  async function handleClick(e: CustomEvent) {
    let event = e as any as MouseEvent;
    if (disabled) return;
    if ($api.menuState === MenuStates.Open) {
      $api.closeMenu();
      await tick();
      $buttonStore?.focus({ preventScroll: true });
    } else {
      event.preventDefault();
      event.stopPropagation();
      $api.openMenu();
      await tick();
      $itemsStore?.focus({ preventScroll: true });
    }
  }

  $: propsWeControl = {
    id,
    "aria-haspopup": true,
    "aria-controls": $itemsStore?.id,
    "aria-expanded": disabled ? undefined : $api.menuState === MenuStates.Open,
  };

  $: slot = { open: $api.menuState === MenuStates.Open };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slot}
  use={[...use, forwardEvents]}
  name={"MenuButton"}
  bind:el={$buttonStore}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
>
  <slot {...slot} />
</Render>
