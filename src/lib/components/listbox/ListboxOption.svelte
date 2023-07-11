<script lang="ts" context="module">
  // The HTML typings include `value` so we must ignore it
  type TListboxOptionProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = Omit<TPassThroughProps<TSlotProps, TAsProp, "li">, "value"> & {
    /** The option value */
    value: unknown;
    /** Whether the option should be disabled for keyboard navigation and ARIA purposes */
    disabled?: boolean;
  };
</script>

<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import { ListboxStates, useListboxContext } from "./Listbox.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Focus } from "$lib/utils/calculate-active-index";
  import Render from "$lib/utils/Render.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import type { SupportedAs } from "$lib/internal/elements";
  import { get_current_component } from "svelte/internal";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TListboxOptionProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "li";
  export let use: HTMLActionArray = [];
  export let value: unknown;
  export let disabled = false;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let api = useListboxContext("ListboxOption");
  let id = `headlessui-listbox-option-${useId()}`;

  let buttonRef = $api.buttonRef;

  $: active =
    $api.activeOptionIndex !== null
      ? $api.options[$api.activeOptionIndex].id === id
      : false;

  $: selected = $api.value === value;
  $: dataRef = {
    disabled,
    value,
    textValue: "",
  };

  onMount(() => {
    let textValue = document
      .getElementById(id)
      ?.textContent?.toLowerCase()
      .trim();
    if (textValue !== undefined) dataRef.textValue = textValue;
  });

  onMount(() => $api.registerOption(id, dataRef));
  onDestroy(() => $api.unregisterOption(id));

  let oldState = $api.listboxState;
  let oldSelected = selected;
  let oldActive = active;
  async function updateFocus(
    newState: ListboxStates,
    newSelected: boolean,
    newActive: boolean
  ) {
    // Wait for a tick since we need to ensure registerOption has been applied
    await tick();
    if (newState !== oldState || newSelected !== oldSelected) {
      if (newState === ListboxStates.Open && newSelected) {
        $api.goToOption(Focus.Specific, id);
      }
    }
    if (newState !== oldState || newActive !== oldActive) {
      if (newState === ListboxStates.Open && newActive) {
        document.getElementById(id)?.scrollIntoView?.({ block: "nearest" });
      }
    }
    oldState = newState;
    oldSelected = newSelected;
    oldActive = newActive;
  }
  $: updateFocus($api.listboxState, selected, active);

  async function handleClick(e: CustomEvent) {
    let event = e as any as MouseEvent;
    if (disabled) return event.preventDefault();
    $api.select(value);
    $api.closeListbox();
    await tick();
    $buttonRef?.focus({ preventScroll: true });
  }

  function handleFocus() {
    if (disabled) return $api.goToOption(Focus.Nothing);
    $api.goToOption(Focus.Specific, id);
  }

  function handleMove() {
    if (disabled) return;
    if (active) return;
    $api.goToOption(Focus.Specific, id);
  }

  function handleLeave() {
    if (disabled) return;
    if (!active) return;
    $api.goToOption(Focus.Nothing);
  }

  $: propsWeControl = {
    id,
    role: "option",
    tabIndex: disabled === true ? undefined : -1,
    "aria-disabled": disabled === true ? true : undefined,
    "aria-selected": selected === true ? selected : undefined,
  };

  $: slotProps = { active, selected, disabled };
</script>

<Render
  {...$$restProps}
  {...propsWeControl}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"ListboxOption"}
  on:click={handleClick}
  on:focus={handleFocus}
  on:pointermove={handleMove}
  on:mousemove={handleMove}
  on:pointerleave={handleLeave}
  on:mouseleave={handleLeave}
>
  <slot {...slotProps} />
</Render>
