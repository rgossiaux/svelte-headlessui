<script lang="ts" context="module">
  import type { Readable, Writable } from "svelte/store";
  import { writable } from "svelte/store";
  import { getContext, setContext } from "svelte";
  export enum DisclosureStates {
    Open,
    Closed,
  }

  export interface StateDefinition {
    // State
    disclosureState: DisclosureStates;
    panelStore: Writable<HTMLElement | null>;
    panelId: string;
    buttonStore: Writable<HTMLButtonElement | null>;
    buttonId: string;

    // State mutators
    toggleDisclosure(): void;
    closeDisclosure(): void;

    // Exposed functions
    close(focusableElement: HTMLElement | HTMLElement | null): void;
  }

  let DISCLOSURE_CONTEXT_NAME = "headlessui-disclosure-context";

  export function useDisclosureContext(
    component: string
  ): Readable<StateDefinition> {
    let context: Writable<StateDefinition> | undefined = getContext(
      DISCLOSURE_CONTEXT_NAME
    );

    if (context === undefined) {
      throw new Error(
        `<${component} /> is missing a parent <Disclosure /> component.`
      );
    }

    return context;
  }

  type TDisclosureProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {
    /** Whether the `Disclosure` should be open by default */
    defaultOpen?: boolean;
  };
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id";
  import { match } from "$lib/utils/match";
  import { State, useOpenClosedProvider } from "$lib/internal/open-closed";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import type { TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TDisclosureProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];
  export let defaultOpen = false;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component());

  /***** Component *****/
  let buttonId = `headlessui-disclosure-button-${useId()}`;
  let panelId = `headlessui-disclosure-panel-${useId()}`;

  let disclosureState: StateDefinition["disclosureState"] = defaultOpen
    ? DisclosureStates.Open
    : DisclosureStates.Closed;
  let panelStore: StateDefinition["panelStore"] = writable(null);
  let buttonStore: StateDefinition["buttonStore"] = writable(null);

  let api = writable<StateDefinition>({
    buttonId,
    panelId,
    disclosureState,
    panelStore,
    buttonStore,
    toggleDisclosure() {
      disclosureState = match(disclosureState, {
        [DisclosureStates.Open]: DisclosureStates.Closed,
        [DisclosureStates.Closed]: DisclosureStates.Open,
      });
    },
    closeDisclosure() {
      if (disclosureState === DisclosureStates.Closed) return;
      disclosureState = DisclosureStates.Closed;
    },
    close(focusableElement: HTMLElement | null) {
      $api.closeDisclosure();

      let restoreElement = (() => {
        if (!focusableElement) return $buttonStore;
        if (focusableElement instanceof HTMLElement) return focusableElement;

        return $buttonStore;
      })();

      restoreElement?.focus();
    },
  });
  setContext(DISCLOSURE_CONTEXT_NAME, api);

  $: api.update((obj) => {
    return {
      ...obj,
      disclosureState,
    };
  });

  function computeOpenClosedState(disclosureState: DisclosureStates) {
    return match(disclosureState, {
      [DisclosureStates.Open]: State.Open,
      [DisclosureStates.Closed]: State.Closed,
    });
  }

  let openClosedState = writable<State>(
    computeOpenClosedState(disclosureState)
  );

  useOpenClosedProvider(openClosedState);

  $: $openClosedState = computeOpenClosedState(disclosureState);

  $: slotProps = {
    open: disclosureState === DisclosureStates.Open,
    close: $api.close,
  };
</script>

<Render
  {...$$restProps}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"Disclosure"}
>
  <slot {...slotProps} />
</Render>
