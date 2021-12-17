<script lang="ts">
  import { useSwitchContext } from "./SwitchGroup.svelte";
  import type { LabelContext } from "$lib/components/label/LabelProvider.svelte";
  import { useDescriptionContext } from "$lib/components/description/DescriptionProvider.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Keys } from "$lib/utils/keyboard";
  import { getContext, createEventDispatcher } from "svelte";
  import type { Writable } from "svelte/store";

  const dispatch = createEventDispatcher();
  export let checked = false;
  let api = useSwitchContext();
  let labelContext: Writable<LabelContext> | undefined = getContext(
    "headlessui-label-context"
  );
  let descriptionContext = useDescriptionContext();
  let id = `headlessui-switch-${useId()}`;
  $: switchStore = $api?.switchStore;

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

  $: classStyle = $$props.class
    ? typeof $$props.class === "function"
      ? $$props.class({
          checked,
        })
      : $$props.class
    : "";
</script>

{#if switchStore}
  <button
    {...{ ...$$restProps, ...propsWeControl }}
    bind:this={$switchStore}
    class={classStyle}
    on:click={handleClick}
    on:keyup={handleKeyUp}
    on:keypress={handleKeyPress}
  >
    <slot {checked} />
  </button>
{:else}
  <button
    {...{ ...$$restProps, ...propsWeControl }}
    class={classStyle}
    on:click={handleClick}
    on:keyup={handleKeyUp}
    on:keypress={handleKeyPress}
  >
    <slot {checked} />
  </button>
{/if}
