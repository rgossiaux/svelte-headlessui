<script lang="ts">
  import { useDisclosureContext, DisclosureStates } from "./Disclosure.svelte";
  import { usePanelContext } from "./DisclosurePanel.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Keys } from "$lib/utils/keyboard";
  export let disabled = false;
  const api = useDisclosureContext("DisclosureButton");
  const panelContext = usePanelContext();
  const id = `headlessui-disclosure-button-${useId()}`;

  $: buttonStore = $api.buttonStore;
  $: panelStore = $api.panelStore;

  $: isWithinPanel =
    panelContext === null ? false : panelContext === $api.panelId;

  function handleClick() {
    if (disabled) return;

    if (isWithinPanel) {
      $api.toggleDisclosure();
      $buttonStore?.focus();
    } else {
      $api.toggleDisclosure();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (disabled) return;

    if (isWithinPanel) {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault();
          event.stopPropagation();
          $api.toggleDisclosure();
          $buttonStore?.focus();
          break;
      }
    } else {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault();
          event.stopPropagation();
          $api.toggleDisclosure();
          break;
      }
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

  $: propsWeControl = isWithinPanel
    ? {}
    : {
        id,
        "aria-expanded": disabled
          ? undefined
          : $api.disclosureState === DisclosureStates.Open,
        "aria-controls": $panelStore ? $api.panelId : undefined,
        disabled: disabled ? true : undefined,
      };
</script>

{#if isWithinPanel}
  <button
    {...{ ...$$restProps, ...propsWeControl }}
    on:click={handleClick}
    on:keydown={handleKeyDown}
  >
    <slot
      open={$api.disclosureState === DisclosureStates.Open}
      close={$api.close}
    />
  </button>
{:else}
  <button
    {...{ ...$$restProps, ...propsWeControl }}
    bind:this={$buttonStore}
    on:click={handleClick}
    on:keydown={handleKeyDown}
    on:keyup={handleKeyUp}
  >
    <slot
      open={$api.disclosureState === DisclosureStates.Open}
      close={$api.close}
    />
  </button>
{/if}
