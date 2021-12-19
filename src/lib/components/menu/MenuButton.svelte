<script lang="ts">
  import { useMenuContext, MenuStates } from "./Menu.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Keys } from "$lib/utils/keyboard";
  import { Focus } from "$lib/utils/calculate-active-index";
  import { tick } from "svelte";
  import { ActionArray, useActions } from "$lib/hooks/use-actions";
  export let use: ActionArray = [];
  export let disabled = false;
  const api = useMenuContext("MenuButton");
  const id = `headlessui-menu-button-${useId()}`;

  $: buttonStore = $api.buttonStore;
  $: itemsStore = $api.itemsStore;
  async function handleKeyDown(event: KeyboardEvent) {
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

  function handleKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault();
        break;
    }
  }

  async function handleClick(event: MouseEvent) {
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
</script>

<button
  {...{ ...$$restProps, ...propsWeControl }}
  bind:this={$buttonStore}
  use:useActions={use}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
>
  <slot open={$api.menuState === MenuStates.Open} />
</button>
