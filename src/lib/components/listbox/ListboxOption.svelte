<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { ListboxStates, StateDefinition } from "./Listbox.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Focus } from "$lib/utils/calculate-active-index";
  export let value: any;
  export let disabled = false;
  let api: SvelteStore<StateDefinition> = getContext("api");
  let id = `headlessui-listbox-option-${useId()}`;

  $: active =
    $api?.activeOptionIndex !== null
      ? $api?.options[$api.activeOptionIndex].id === id
      : false;

  $: selected = $api?.value === value;
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

  let oldState = $api?.listboxState;
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
        $api?.goToOption(Focus.Specific, id);
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
  $: updateFocus($api?.listboxState, selected, active);

  async function handleClick(event: MouseEvent) {
    if (disabled) return event.preventDefault();
    $api.select(value);
    $api.closeListbox();
    await tick();
    $api.buttonRef?.focus({ preventScroll: true });
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

  $: classStyle = $$props.class
    ? typeof $$props.class === "function"
      ? $$props.class({ active, selected, disabled })
      : $$props.class
    : "";
</script>

<li
  {...$$restProps}
  class={classStyle}
  {...propsWeControl}
  on:click={handleClick}
  on:focus={handleFocus}
  on:pointermove={handleMove}
  on:mousemove={handleMove}
  on:pointerleave={handleLeave}
  on:mouseleave={handleLeave}
>
  <slot {active} {selected} {disabled} />
</li>
