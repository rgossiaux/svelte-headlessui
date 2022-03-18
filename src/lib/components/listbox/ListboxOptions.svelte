<script lang="ts" context="module">
  type TListboxOptionsProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "ul"> & {
    /** Whether the element should ignore the internally managed open/closed state */
    static?: boolean;
    /** Whether the element should be unmounted, instead of just hidden, based on the open/closed state	*/
    unmount?: boolean;
  };
</script>

<script lang="ts">
  import { tick } from "svelte";
  import { ListboxStates, useListboxContext } from "./Listbox.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { match } from "$lib/utils/match";
  import { Keys } from "$lib/utils/keyboard";
  import { Focus } from "$lib/utils/calculate-active-index";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import Render from "$lib/utils/Render.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { get_current_component } from "svelte/internal";
  import { Features, type TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TListboxOptionsProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "ul";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let api = useListboxContext("ListboxOptions");
  let id = `headlessui-listbox-options-${useId()}`;
  let optionsRef = $api.optionsRef;
  let buttonRef = $api.buttonRef;
  let labelRef = $api.labelRef;

  let searchDebounce: ReturnType<typeof setTimeout> | null = null;
  async function handleKeyDown(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    if (searchDebounce) clearTimeout(searchDebounce);

    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

      case Keys.Space:
        if ($api.searchQuery !== "") {
          event.preventDefault();
          event.stopPropagation();
          return $api.search(event.key);
        }
      // When in type ahead mode, fallthrough
      case Keys.Enter:
        event.preventDefault();
        event.stopPropagation();
        if ($api.activeOptionIndex !== null) {
          let { dataRef } = $api.options[$api.activeOptionIndex];
          $api.select(dataRef.value);
        }
        $api.closeListbox();
        await tick();
        $buttonRef?.focus({ preventScroll: true });
        break;

      case match($api.orientation, {
        vertical: Keys.ArrowDown,
        horizontal: Keys.ArrowRight,
      }):
        event.preventDefault();
        event.stopPropagation();
        return $api.goToOption(Focus.Next);

      case match($api.orientation, {
        vertical: Keys.ArrowUp,
        horizontal: Keys.ArrowLeft,
      }):
        event.preventDefault();
        event.stopPropagation();
        return $api.goToOption(Focus.Previous);

      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault();
        event.stopPropagation();
        return $api.goToOption(Focus.First);

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault();
        event.stopPropagation();
        return $api.goToOption(Focus.Last);

      case Keys.Escape:
        event.preventDefault();
        event.stopPropagation();
        $api.closeListbox();
        await tick();
        $buttonRef?.focus({ preventScroll: true });
        break;

      case Keys.Tab:
        event.preventDefault();
        event.stopPropagation();
        break;

      default:
        if (event.key.length === 1) {
          $api.search(event.key);
          searchDebounce = setTimeout(() => $api.clearSearch(), 350);
        }
        break;
    }
  }

  $: propsWeControl = {
    "aria-activedescendant":
      $api.activeOptionIndex === null
        ? undefined
        : $api.options[$api.activeOptionIndex]?.id,
    "aria-labelledby": $labelRef?.id ?? $buttonRef?.id,
    "aria-orientation": $api.orientation,
    id,
    role: "listbox",
    tabIndex: 0,
  };

  let usesOpenClosedState = useOpenClosed();
  $: visible =
    usesOpenClosedState !== undefined
      ? $usesOpenClosedState === State.Open
      : $api.listboxState === ListboxStates.Open;

  $: slotProps = { open: $api.listboxState === ListboxStates.Open };
</script>

<Render
  {...$$restProps}
  {...propsWeControl}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"ListboxOptions"}
  bind:el={$optionsRef}
  on:keydown={handleKeyDown}
  {visible}
  features={Features.RenderStrategy | Features.Static}
>
  <slot {...slotProps} />
</Render>
