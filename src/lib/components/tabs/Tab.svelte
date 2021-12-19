<script lang="ts">
  import { onMount } from "svelte";
  import { Focus, focusIn } from "$lib/utils/focus-management";
  import { Keys } from "$lib/utils/keyboard";
  import { match } from "$lib/utils/match";

  import { useTabsContext } from "./TabGroup.svelte";
  import { useId } from "$lib/hooks/use-id";

  export let disabled = false;

  let api = useTabsContext("Tab");
  let id = `headlessui-tabs-tab-${useId()}`;
  let tabRef: HTMLElement | null = null;

  onMount(() => {
    $api.registerTab(tabRef);
    return () => $api.unregisterTab(tabRef);
  });

  $: myIndex = $api.tabs.indexOf(tabRef);
  $: selected = myIndex === $api.selectedIndex;

  function handleKeyDown(event: KeyboardEvent) {
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

  $: propsWeControl = {
    id,
    role: "tab",
    "aria-controls": $api.panels[myIndex],
    "aria-selected": selected,
    tabIndex: selected ? 0 : -1,
    disabled: disabled ? true : undefined,
  };

  $: classStyle = $$props.class
    ? typeof $$props.class === "function"
      ? $$props.class({
          selected,
        })
      : $$props.class
    : "";
</script>

<button
  {...{ ...$$restProps, ...propsWeControl }}
  bind:this={tabRef}
  class={classStyle}
  on:keydown={handleKeyDown}
  on:click={handleSelection}
  on:focus={$api.activation === "manual" ? handleFocus : handleSelection}
>
  <slot {selected} />
</button>
