<script lang="ts">
  import type { StateDefinition } from "./SwitchGroup.svelte";
  import type { LabelContext } from "$lib/components/label/LabelProvider.svelte";
  import type { DescriptionContext } from "$lib/components/description/DescriptionProvider.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Keys } from "$lib/utils/keyboard";
  import { getContext, createEventDispatcher } from "svelte";
  import type { Writable } from "svelte/store";

  const dispatch = createEventDispatcher();
  export let checked = false;
  let api: Writable<StateDefinition> | undefined = getContext("SwitchApi");
  let labelContext: Writable<LabelContext> | undefined = getContext(
    "headlessui-label-context"
  );
  let descriptionContext: Writable<DescriptionContext> | undefined = getContext(
    "headlessui-description-context"
  );
  let id = `headlessui-switch-${useId()}`;
  $: switchStore = $api?.switchStore;
  let internalSwitchRef = null;

  function toggle() {
    dispatch("updateValue", !checked);
  }

  function handleClick(event: MouseEvent) {
    event.preventDefault();
    toggle();
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key !== Keys.Tab) event.preventDefault();
    if (event.key === Keys.Space) toggle();
  }

  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  function handleKeyPress(event: KeyboardEvent) {
    event.preventDefault();
  }

  $: propsWeControl = {
    id,
    role: "switch",
    tabIndex: 0,
    "aria-checked": checked,
    "aria-labelledby": $labelContext?.labelIds,
    "aria-describedby": $descriptionContext?.descriptionIds,
  };
</script>

{#if switchStore}
  <button
    {...{ ...$$restProps, ...propsWeControl }}
    bind:this={$switchStore}
    on:click={handleClick}
    on:keyup={handleKeyUp}
    on:keypress={handleKeyPress}
  >
    <slot />
  </button>
{:else}
  <button
    {...{ ...$$restProps, ...propsWeControl }}
    bind:this={$internalSwitchRef}
    on:click={handleClick}
    on:keyup={handleKeyUp}
    on:keypress={handleKeyPress}
  >
    <slot />
  </button>
{/if}
