<script lang="ts">
  import { tick } from "svelte";
  import { ListboxStates, useListboxContext } from "./Listbox.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Keys } from "$lib/utils/keyboard";
  import { Focus } from "$lib/utils/calculate-active-index";

  let api = useListboxContext("ListboxButton");
  let id = `headlessui-listbox-button-${useId()}`;
  let buttonRef = $api.buttonRef;
  let optionsRef = $api.optionsRef;
  let labelRef = $api.labelRef;

  async function handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
      case Keys.Space:
      case Keys.Enter:
      case Keys.ArrowDown:
        event.preventDefault();
        $api.openListbox();
        await tick();
        $optionsRef?.focus({ preventScroll: true });
        if (!$api.value) $api.goToOption(Focus.First);
        break;

      case Keys.ArrowUp:
        event.preventDefault();
        $api.openListbox();
        await tick();
        $optionsRef?.focus({ preventScroll: true });
        if (!$api.value) $api.goToOption(Focus.Last);
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
    if ($api.disabled) return;
    if ($api.listboxState === ListboxStates.Open) {
      $api.closeListbox();
      await tick();
      $buttonRef?.focus({ preventScroll: true });
    } else {
      event.preventDefault();
      $api.openListbox();
      await tick();
      $optionsRef?.focus({ preventScroll: true });
    }
  }

  $: propsWeControl = {
    id,
    "aria-haspopup": true,
    "aria-controls": $optionsRef?.id,
    "aria-expanded": $api.disabled
      ? undefined
      : $api?.listboxState === ListboxStates.Open,
    "aria-labelledby": $labelRef ? [$labelRef?.id, id].join(" ") : undefined,
    disabled: $api?.disabled === true ? true : undefined,
  };
</script>

<button
  {...$$restProps}
  {...propsWeControl}
  bind:this={$buttonRef}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
>
  <slot
    open={$api.listboxState === ListboxStates.Open}
    disabled={$api.disabled}
  />
</button>
