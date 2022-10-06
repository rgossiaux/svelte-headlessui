<script lang="ts" context="module">
  type TSwitchProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "button"> & {
    /** Whether the switch is checked */
    checked: boolean;
    /** The name used when using this component inside a form. */
    name?: string;
    /** The value used when using this component inside a form, if it is checked. */
    value?: string;
  };
</script>

<script lang="ts">
  import { useSwitchContext } from "./SwitchGroup.svelte";
  import { useLabelContext } from "$lib/components/label/LabelProvider.svelte";
  import { useDescriptionContext } from "$lib/components/description/DescriptionProvider.svelte";
  import { useId } from "$lib/hooks/use-id";
  import { Keys } from "$lib/utils/keyboard";
  import { createEventDispatcher } from "svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import { resolveButtonType } from "$lib/utils/resolve-button-type";
  import type { TPassThroughProps } from "$lib/types";
  import Hidden, { Features as HiddenFeatures } from "$lib/internal/Hidden.svelte";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TSwitchProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "button";
  export let use: HTMLActionArray = [];
  export let checked = false;
  export let name: string | null = null;
  export let value: string | null = null;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "change",
  ]);
  const dispatch = createEventDispatcher<{
    change: boolean;
  }>();

  /***** Component *****/
  let api = useSwitchContext();
  let labelContext = useLabelContext();
  let descriptionContext = useDescriptionContext();
  let id = `headlessui-switch-${useId()}`;
  $: switchStore = $api?.switchStore;

  function toggle() {
    dispatch("change", !checked);
  }

  function handleClick(e: CustomEvent) {
    let event = e as any as MouseEvent;
    event.preventDefault();
    toggle();
  }

  function handleKeyUp(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    if (event.key !== Keys.Tab) event.preventDefault();
    if (event.key === Keys.Space) toggle();
  }

  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  function handleKeyPress(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    event.preventDefault();
  }

  $: propsWeControl = {
    id,
    role: "switch",
    type: resolveButtonType({ type: $$props.type, as }, $switchStore),
    tabIndex: 0,
    "aria-checked": checked,
    "aria-labelledby": $labelContext?.labelIds,
    "aria-describedby": $descriptionContext?.descriptionIds,
  };

  $: slotProps = { checked };
</script>

{#if name != null && checked}
  <Hidden
    features={HiddenFeatures.Hidden}
    as="input"
    type="checkbox"
    hidden
    readonly
    {name}
    bind:checked
    bind:value
  />
{/if}
<!-- TODO: I'm sure there's a better way of doing this -->
{#if switchStore}
  <Render
    {...{ ...$$restProps, ...propsWeControl }}
    {as}
    {slotProps}
    use={[...use, forwardEvents]}
    name={"Switch"}
    bind:el={$switchStore}
    on:click={handleClick}
    on:keyup={handleKeyUp}
    on:keypress={handleKeyPress}
  >
    <slot {...slotProps} />
  </Render>
{:else}
  <Render
    {...{ ...$$restProps, ...propsWeControl }}
    {as}
    {slotProps}
    use={[...use, forwardEvents]}
    name={"Switch"}
    on:click={handleClick}
    on:keyup={handleKeyUp}
    on:keypress={handleKeyPress}
  >
    <slot {...slotProps} />
  </Render>
{/if}
