<script lang="ts" context="module">
  type TDisclosureButtonProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "button"> & {
    disabled?: boolean;
  };
</script>

<script lang="ts">
  import { useDisclosureContext, DisclosureStates } from "./Disclosure.svelte";
  import { usePanelContext } from "./DisclosurePanel.svelte";
  import { Keys } from "$lib/utils/keyboard";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import { writable } from "svelte/store";
  import { resolveButtonType } from "$lib/utils/resolve-button-type";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TDisclosureButtonProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "button";
  export let use: HTMLActionArray = [];
  export let disabled = false;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  const api = useDisclosureContext("DisclosureButton");
  const panelContext = usePanelContext();

  $: buttonStore = $api.buttonStore;
  $: panelStore = $api.panelStore;

  $: isWithinPanel =
    panelContext === null ? false : panelContext === $api.panelId;

  let ourStore = writable<HTMLElement | null>(null);
  $: if (!isWithinPanel) ourStore = buttonStore;

  function handleClick() {
    if (disabled) return;

    if (isWithinPanel) {
      $api.toggleDisclosure();
      $buttonStore?.focus();
    } else {
      $api.toggleDisclosure();
    }
  }

  function handleKeyDown(e: CustomEvent) {
    if (disabled) return;
    let event = e as any as KeyboardEvent;

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

  $: type = resolveButtonType({ type: $$props.type, as }, $ourStore);
  $: propsWeControl = isWithinPanel
    ? { type }
    : {
        id: $api.buttonId,
        type,
        "aria-expanded": disabled
          ? undefined
          : $api.disclosureState === DisclosureStates.Open,
        "aria-controls": $panelStore ? $api.panelId : undefined,
        disabled: disabled ? true : undefined,
      };

  $: slotProps = {
    open: $api.disclosureState === DisclosureStates.Open,
    close: $api.close,
  };
</script>

{#if isWithinPanel}
  <Render
    {...{ ...$$restProps, ...propsWeControl }}
    {as}
    {slotProps}
    use={[...use, forwardEvents]}
    name={"DisclosureButton"}
    bind:el={$ourStore}
    on:click={handleClick}
    on:keydown={handleKeyDown}
  >
    <slot {...slotProps} />
  </Render>
{:else}
  <Render
    {...{ ...$$restProps, ...propsWeControl }}
    {as}
    {slotProps}
    use={[...use, forwardEvents]}
    name={"DisclosureButton"}
    bind:el={$ourStore}
    on:click={handleClick}
    on:keydown={handleKeyDown}
    on:keyup={handleKeyUp}
  >
    <slot {...slotProps} />
  </Render>
{/if}
