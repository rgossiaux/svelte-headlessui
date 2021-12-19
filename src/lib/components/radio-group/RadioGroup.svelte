<script lang="ts" context="module">
  import DescriptionProvider from "$lib/components/description/DescriptionProvider.svelte";
  import LabelProvider from "$lib/components/label/LabelProvider.svelte";
  import { createEventDispatcher, getContext, setContext } from "svelte";
  import { Writable, writable } from "svelte/store";
  import { Focus, focusIn, FocusResult } from "$lib/utils/focus-management";
  import { Keys } from "$lib/utils/keyboard";
  import { useId } from "$lib/hooks/use-id";
  export interface Option {
    id: string;
    element: HTMLElement | null;
    propsRef: { value: unknown; disabled: boolean };
  }

  export interface StateDefinition {
    // State
    options: Option[];
    value: unknown;
    disabled: boolean;
    firstOption: Option | undefined;
    containsCheckedOption: boolean;

    // State mutators
    change(nextValue: unknown): boolean;
    registerOption(action: Option): void;
    unregisterOption(id: Option["id"]): void;
  }

  const RADIO_GROUP_CONTEXT_NAME = "headlessui-radio-group-context";
  export function useRadioGroupContext(
    component: string
  ): Writable<StateDefinition> {
    const context = getContext(RADIO_GROUP_CONTEXT_NAME) as
      | Writable<StateDefinition>
      | undefined;

    if (context === undefined) {
      throw new Error(
        `<${component} /> is missing a parent <RadioGroup /> component.`
      );
    }

    return context;
  }
</script>

<script lang="ts">
  import { treeWalker } from "$lib/hooks/use-tree-walker";
  export let disabled = false;
  export let value: StateDefinition["value"];
  let radioGroupRef: HTMLElement | null = null;
  let options: StateDefinition["options"] = [];

  let id = `headlessui-radiogroup-${useId()}`;

  const dispatch = createEventDispatcher();

  let api: Writable<StateDefinition> = writable({
    options,
    value,
    disabled,
    firstOption: options.find((option) => !option.propsRef.disabled),
    containsCheckedOption: options.some(
      (option) => option.propsRef.value === value
    ),
    change(nextValue: unknown) {
      if (disabled) return false;
      if (value === nextValue) return false;
      let nextOption = options.find(
        (option) => option.propsRef.value === nextValue
      )?.propsRef;
      if (nextOption?.disabled) return false;
      dispatch("change", nextValue);
      return true;
    },
    registerOption(action: Option) {
      options = [...options, action];
    },
    unregisterOption(id: Option["id"]) {
      options = options.filter((radio) => radio.id !== id);
    },
  });
  setContext(RADIO_GROUP_CONTEXT_NAME, api);

  $: api.update((obj) => {
    return {
      ...obj,
      options,
      value,
      disabled,
      firstOption: options.find((option) => !option.propsRef.disabled),
      containsCheckedOption: options.some(
        (option) => option.propsRef.value === value
      ),
    };
  });

  $: treeWalker({
    container: radioGroupRef,
    accept(node) {
      if (node.getAttribute("role") === "radio")
        return NodeFilter.FILTER_REJECT;
      if (node.hasAttribute("role")) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
    walk(node) {
      node.setAttribute("role", "none");
    },
  });

  function handleKeyDown(event: KeyboardEvent) {
    if (!radioGroupRef) return;
    if (!radioGroupRef.contains(event.target as HTMLElement)) return;

    let all = options
      .filter((option) => option.propsRef.disabled === false)
      .map((radio) => radio.element) as HTMLElement[];

    switch (event.key) {
      case Keys.ArrowLeft:
      case Keys.ArrowUp:
        {
          event.preventDefault();
          event.stopPropagation();

          let result = focusIn(all, Focus.Previous | Focus.WrapAround);

          if (result === FocusResult.Success) {
            let activeOption = options.find(
              (option) => option.element === document.activeElement
            );
            if (activeOption) $api.change(activeOption.propsRef.value);
          }
        }
        break;

      case Keys.ArrowRight:
      case Keys.ArrowDown:
        {
          event.preventDefault();
          event.stopPropagation();

          let result = focusIn(all, Focus.Next | Focus.WrapAround);

          if (result === FocusResult.Success) {
            let activeOption = options.find(
              (option) => option.element === document.activeElement
            );
            if (activeOption) $api.change(activeOption.propsRef.value);
          }
        }
        break;

      case Keys.Space:
        {
          event.preventDefault();
          event.stopPropagation();

          let activeOption = options.find(
            (option) => option.element === document.activeElement
          );
          if (activeOption) $api.change(activeOption.propsRef.value);
        }
        break;
    }
  }

  $: propsWeControl = {
    id,
    role: "radiogroup",
  };
</script>

<DescriptionProvider name="RadioGroup.Description" let:describedby>
  <LabelProvider name="RadioGroup.Label" let:labelledby>
    <div
      {...{ ...$$restProps, ...propsWeControl }}
      bind:this={radioGroupRef}
      aria-labelledby={labelledby}
      aria-describedby={describedby}
      on:keydown={handleKeyDown}
    >
      <slot />
    </div>
  </LabelProvider>
</DescriptionProvider>
