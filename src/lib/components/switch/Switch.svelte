<script lang="ts">
  import { useSwitchContext } from "./SwitchGroup.svelte";
  import { useLabelContext } from "$lib/components/label/LabelProvider.svelte";
  import { useDescriptionContext } from "$lib/components/description/DescriptionProvider.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Keys } from "$lib/utils/keyboard";
  import { createEventDispatcher } from "svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "change",
  ]);
  export let as: SupportedAs = "button";
  export let use: HTMLActionArray = [];

  const dispatch = createEventDispatcher();
  export let checked = false;
  let api = useSwitchContext();
  let labelContext = useLabelContext();
  let descriptionContext = useDescriptionContext();
  let id = `headlessui-switch-${useId()}`;
  $: switchStore = $api?.switchStore;

  function toggle() {
    dispatch("change", !checked);
  }

  function handleClick(e: CustomEvent) {
    let event = e as any as MouseEvent;
    event.preventDefault();
    toggle();
  }

  function handleKeyUp(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    if (event.key !== Keys.Tab) event.preventDefault();
    if (event.key === Keys.Space) toggle();
  }

  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  function handleKeyPress(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
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

  $: slot = { checked };
</script>

<!-- TODO: I'm sure there's a better way of doing this -->
{#if switchStore}
  <Render
    {...{ ...$$restProps, ...propsWeControl }}
    {as}
    {slot}
    use={[...use, forwardEvents]}
    name={"Switch"}
    bind:el={$switchStore}
    on:click={handleClick}
    on:keyup={handleKeyUp}
    on:keypress={handleKeyPress}
  >
    <slot {...slot} />
  </Render>
{:else}
  <Render
    {...{ ...$$restProps, ...propsWeControl }}
    {as}
    {slot}
    use={[...use, forwardEvents]}
    name={"Switch"}
    bind:el={$switchStore}
    on:click={handleClick}
    on:keyup={handleKeyUp}
    on:keypress={handleKeyPress}
  >
    <slot {...slot} />
  </Render>
{/if}
