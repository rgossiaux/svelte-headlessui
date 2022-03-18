<script lang="ts" context="module">
  export enum PopoverStates {
    Open,
    Closed,
  }
  export interface StateDefinition {
    // State
    popoverState: PopoverStates;
    button: Writable<HTMLElement | null>;
    buttonId: string;
    panel: Writable<HTMLElement | null>;
    panelId: string;

    // State mutators
    togglePopover(): void;
    closePopover(): void;

    // Exposed functions
    close(focusableElement: HTMLElement | null): void;
  }

  export interface PopoverRegisterBag {
    buttonId: string;
    panelId: string;
    close(): void;
  }

  const POPOVER_CONTEXT_NAME = "headlessui-popover-context";
  export function usePopoverContext(
    component: string
  ): Readable<StateDefinition> {
    let context = getContext(POPOVER_CONTEXT_NAME) as
      | Writable<StateDefinition>
      | undefined;
    if (context === undefined) {
      throw new Error(
        `<${component} /> is missing a parent <Popover /> component.`
      );
    }
    return context;
  }
  type TPopoverProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {};
</script>

<script lang="ts">
  import { match } from "$lib/utils/match";
  import { useId } from "$lib/hooks/use-id";
  import {
    isFocusableElement,
    FocusableMode,
  } from "$lib/utils/focus-management";
  import { State, useOpenClosedProvider } from "$lib/internal/open-closed";
  import { usePopoverGroupContext } from "./PopoverGroup.svelte";
  import { getContext, setContext, onMount } from "svelte";
  import type { Readable, Writable } from "svelte/store";
  import { writable } from "svelte/store";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TPopoverProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  const buttonId = `headlessui-popover-button-${useId()}`;
  const panelId = `headlessui-popover-panel-${useId()}`;
  let popoverState: StateDefinition["popoverState"] = PopoverStates.Closed;
  let panel: StateDefinition["panel"] = writable(null);
  let button: StateDefinition["button"] = writable(null);

  let api = writable<StateDefinition>({
    popoverState,
    buttonId,
    panelId,
    panel,
    button,
    togglePopover() {
      popoverState = match(popoverState, {
        [PopoverStates.Open]: PopoverStates.Closed,
        [PopoverStates.Closed]: PopoverStates.Open,
      });
    },
    closePopover() {
      if (popoverState === PopoverStates.Closed) return;
      popoverState = PopoverStates.Closed;
    },
    close(focusableElement: HTMLElement | null) {
      $api.closePopover();

      let restoreElement = (() => {
        if (!focusableElement) return $button;
        if (focusableElement instanceof HTMLElement) return focusableElement;

        return $button;
      })();

      restoreElement?.focus();
    },
  });
  setContext(POPOVER_CONTEXT_NAME, api);

  let openClosedState = writable<State>(State.Closed);
  useOpenClosedProvider(openClosedState);

  $: $openClosedState = match(popoverState, {
    [PopoverStates.Open]: State.Open,
    [PopoverStates.Closed]: State.Closed,
  });

  $: api.update((obj) => {
    return {
      ...obj,
      popoverState,
    };
  });

  const registerBag = {
    buttonId,
    panelId,
    close() {
      $api.closePopover();
    },
  };

  const groupContext = usePopoverGroupContext();
  const registerPopover = groupContext?.registerPopover;

  function isFocusWithinPopoverGroup() {
    return (
      groupContext?.isFocusWithinPopoverGroup() ??
      ($button?.contains(document.activeElement) ||
        $panel?.contains(document.activeElement))
    );
  }

  onMount(() => registerPopover?.(registerBag));

  // Handle focus out
  function handleFocus(event: FocusEvent) {
    if (event.target === window.document.body) {
      // Workaround for a SvelteKit issue: https://github.com/sveltejs/kit/issues/3501
      return;
    }
    if (popoverState !== PopoverStates.Open) return;
    if (isFocusWithinPopoverGroup()) return;
    if (!button) return;
    if (!panel) return;

    $api.closePopover();
  }

  // Handle outside click
  function handleMousedown(event: MouseEvent) {
    let target = event.target as HTMLElement;

    if (popoverState !== PopoverStates.Open) return;

    if ($button?.contains(target)) return;
    if ($panel?.contains(target)) return;

    $api.closePopover();

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault();
      $button?.focus();
    }
  }

  $: slotProps = {
    open: popoverState === PopoverStates.Open,
    close: $api.close,
  };
</script>

<svelte:window on:focus|capture={handleFocus} on:mousedown={handleMousedown} />
<Render
  {...$$restProps}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"Popover"}
>
  <slot {...slotProps} />
</Render>
