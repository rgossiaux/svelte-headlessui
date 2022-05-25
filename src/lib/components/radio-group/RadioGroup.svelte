<script lang="ts" context="module">
  import DescriptionProvider from "$lib/components/description/DescriptionProvider.svelte";
  import LabelProvider from "$lib/components/label/LabelProvider.svelte";
  import { getContext, setContext } from "svelte";
  import type { Readable, Writable } from "svelte/store";
  import { writable } from "svelte/store";
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
  ): Readable<StateDefinition> {
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

  type TRadioGroupProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {
    /** The currently selected value in the `RadioGroup` */
    value: StateDefinition["value"];
    /** Whether the `RadioGroup` and all of its `RadioGroupOption`s are disabled */
    disabled?: boolean;
  };
</script>

<script lang="ts">
  import { treeWalker } from "$lib/hooks/use-tree-walker";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TRadioGroupProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];
  export let value: StateDefinition["value"];
  export let disabled = false;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let radioGroupRef: HTMLElement | null = null;
  let options: StateDefinition["options"] = [];

  let id = `headlessui-radiogroup-${useId()}`;

  let api = writable<StateDefinition>({
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
      value = nextValue;
      return true;
    },
    registerOption(action: Option) {
      if (!radioGroupRef) {
        // We haven't mounted yet so just append
        options = [...options, action];
        return;
      }
      let orderMap = Array.from(
        radioGroupRef.querySelectorAll('[id^="headlessui-radiogroup-option-"]')!
      ).reduce(
        (lookup, element, index) =>
          Object.assign(lookup, { [element.id]: index }),
        {}
      ) as Record<string, number>;

      let newOptions = [...options, action];
      newOptions.sort((a, z) => orderMap[a.id] - orderMap[z.id]);
      options = newOptions;
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

  function handleKeyDown(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
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

  $: slotProps = {};
</script>

<DescriptionProvider name="RadioGroupDescription" let:describedby>
  <LabelProvider name="RadioGroupLabel" let:labelledby>
    <Render
      {...{ ...$$restProps, ...propsWeControl }}
      {as}
      use={[...use, forwardEvents]}
      {slotProps}
      name={"RadioGroup"}
      bind:el={radioGroupRef}
      aria-labelledby={labelledby}
      aria-describedby={describedby}
      on:keydown={handleKeyDown}
    >
      <slot {...slotProps} />
    </Render>
  </LabelProvider>
</DescriptionProvider>
