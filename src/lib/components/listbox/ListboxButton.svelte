<script lang="ts" context="module">
  type TListboxButtonProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "button"> & {};
</script>

<script lang="ts">
  import { tick } from "svelte";
  import { ListboxStates, useListboxContext } from "./Listbox.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Keys } from "$lib/utils/keyboard";
  import { Focus } from "$lib/utils/calculate-active-index";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { get_current_component } from "svelte/internal";
  import Render from "$lib/utils/Render.svelte";
  import { resolveButtonType } from "$lib/utils/resolve-button-type";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TListboxButtonProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "button";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let api = useListboxContext("ListboxButton");
  let id = `headlessui-listbox-button-${useId()}`;
  let buttonRef = $api.buttonRef;
  let optionsRef = $api.optionsRef;
  let labelRef = $api.labelRef;

  async function handleKeyDown(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
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
    type: resolveButtonType({ type: $$props.type, as }, $buttonRef),
    "aria-haspopup": true,
    "aria-controls": $optionsRef?.id,
    "aria-expanded": $api.disabled
      ? undefined
      : $api.listboxState === ListboxStates.Open,
    "aria-labelledby": $labelRef ? [$labelRef?.id, id].join(" ") : undefined,
    disabled: $api.disabled === true ? true : undefined,
  };

  $: slotProps = {
    open: $api.listboxState === ListboxStates.Open,
    disabled: $api.disabled,
  };
</script>

<Render
  {...$$restProps}
  {...propsWeControl}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"ListboxButton"}
  bind:el={$buttonRef}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
>
  <slot {...slotProps} />
</Render>
