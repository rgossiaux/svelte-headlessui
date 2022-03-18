<script lang="ts" context="module">
  type TTabProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "button"> & {
    /** Whether the `Tab` is currently disabled */
    disabled?: boolean;
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { Focus, focusIn } from "$lib/utils/focus-management";
  import { Keys } from "$lib/utils/keyboard";
  import { match } from "$lib/utils/match";
  import { useTabsContext } from "./TabGroup.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import { resolveButtonType } from "$lib/utils/resolve-button-type";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TTabProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "button";
  export let use: HTMLActionArray = [];
  export let disabled = false;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let api = useTabsContext("Tab");
  let id = `headlessui-tabs-tab-${useId()}`;
  let tabRef: HTMLElement | null = null;

  onMount(() => {
    $api.registerTab(tabRef);
    return () => $api.unregisterTab(tabRef);
  });

  $: myIndex = tabRef ? $api.tabs.indexOf(tabRef) : -1;
  $: selected = myIndex === $api.selectedIndex;

  function handleKeyDown(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    let list = $api.tabs.filter(Boolean) as HTMLElement[];

    if (event.key === Keys.Space || event.key === Keys.Enter) {
      event.preventDefault();
      event.stopPropagation();

      $api.setSelectedIndex(myIndex);
      return;
    }

    switch (event.key) {
      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault();
        event.stopPropagation();

        return focusIn(list, Focus.First);

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault();
        event.stopPropagation();

        return focusIn(list, Focus.Last);
    }

    return match($api.orientation, {
      vertical() {
        if (event.key === Keys.ArrowUp)
          return focusIn(list, Focus.Previous | Focus.WrapAround);
        if (event.key === Keys.ArrowDown)
          return focusIn(list, Focus.Next | Focus.WrapAround);
        return;
      },
      horizontal() {
        if (event.key === Keys.ArrowLeft)
          return focusIn(list, Focus.Previous | Focus.WrapAround);
        if (event.key === Keys.ArrowRight)
          return focusIn(list, Focus.Next | Focus.WrapAround);
        return;
      },
    });
  }

  function handleFocus() {
    tabRef?.focus();
  }

  function handleSelection() {
    if (disabled) return;

    tabRef?.focus();
    $api.setSelectedIndex(myIndex);
  }

  $: myPanelRef = $api.panels[myIndex]?.ref;
  $: propsWeControl = {
    id,
    role: "tab",
    type: resolveButtonType({ type: $$props.type, as }, tabRef),
    "aria-controls": $myPanelRef ? $api.panels[myIndex]?.id : undefined,
    "aria-selected": selected,
    tabIndex: selected ? 0 : -1,
    disabled: disabled ? true : undefined,
  };
  $: if (process.env.NODE_ENV === "test") {
    Object.assign(propsWeControl, { ["data-headlessui-index"]: myIndex });
  }

  $: slotProps = { selected };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"Tab"}
  bind:el={tabRef}
  on:keydown={handleKeyDown}
  on:click={handleSelection}
  on:focus={$api.activation === "manual" ? handleFocus : handleSelection}
>
  <slot {...slotProps} />
</Render>
