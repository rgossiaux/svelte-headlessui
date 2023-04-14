<script lang="ts" context="module">
  import {
    getContext,
    setContext,
    createEventDispatcher,
    tick,
    onDestroy,
    onMount,
  } from "svelte";
  export enum DialogStates {
    Open,
    Closed,
  }

  export interface StateDefinition {
    dialogState: DialogStates;

    titleId?: string;

    setTitleId(id?: string): void;

    close(): void;
  }

  const DIALOG_CONTEXT_NAME = "headlessui-dialog-context";

  export function useDialogContext(
    component: string
  ): Readable<StateDefinition> {
    let context = getContext(DIALOG_CONTEXT_NAME) as
      | Writable<StateDefinition>
      | undefined;
    if (context === undefined) {
      throw new Error(
        `<${component} /> is missing a parent <Dialog /> component.`
      );
    }
    return context;
  }

  type TDialogProps<
    TSlotProps extends {},
    TAsProp extends SupportedAs
  > = TPassThroughProps<TSlotProps, TAsProp, "div"> & {
    /** Whether the `Dialog` is open */
    open?: boolean;
    /** The element that should receive focus when the Dialog is first opened */
    initialFocus?: HTMLElement | null;
    /** Whether the element should ignore the internally managed open/closed state */
    static?: boolean;
    /** Whether the element should be unmounted, instead of just hidden, based on the open/closed state	*/
    unmount?: boolean;
  };
</script>

<script lang="ts">
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import type { Readable, Writable } from "svelte/store";
  import { writable } from "svelte/store";
  import { match } from "$lib/utils/match";
  import { useId } from "$lib/hooks/use-id";
  import { useInertOthers } from "$lib/hooks/use-inert-others";
  import { contains } from "$lib/internal/dom-containers";
  import { Keys } from "$lib/utils/keyboard";
  import FocusTrap from "$lib/components/focus-trap/FocusTrap.svelte";
  import StackContextProvider, {
    StackMessage,
  } from "$lib/internal/StackContextProvider.svelte";
  import DescriptionProvider from "$lib/components/description/DescriptionProvider.svelte";
  import ForcePortalRootContext from "$lib/internal/ForcePortalRootContext.svelte";
  import Portal from "$lib/components/portal/Portal.svelte";
  import PortalGroup from "$lib/components/portal/PortalGroup.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import Render from "$lib/utils/Render.svelte";
  import { Features, type TPassThroughProps } from "$lib/types";

  /***** Props *****/
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TDialogProps<typeof slotProps, TAsProp>;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];
  export let open: boolean | undefined = undefined;
  export let initialFocus: HTMLElement | null = null;

  /***** Events *****/
  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "close",
  ]);
  const dispatch = createEventDispatcher<{
    close: boolean;
  }>();

  /***** Component *****/
  let containers: Set<HTMLElement> = new Set();
  let openClosedState = useOpenClosed();

  $: {
    open =
      open === undefined && openClosedState !== undefined
        ? match($openClosedState!, {
            [State.Open]: true,
            [State.Closed]: false,
          })
        : open;

    // Validations
    let hasOpen = open !== undefined || openClosedState !== undefined;

    if (!hasOpen) {
      throw new Error(
        `You forgot to provide an \`open\` prop to the \`Dialog\` component.`
      );
    }

    if (typeof open !== "boolean") {
      throw new Error(
        `You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${open}`
      );
    }
  }

  $: dialogState = open ? DialogStates.Open : DialogStates.Closed;
  $: visible =
    openClosedState !== undefined
      ? $openClosedState === State.Open
      : dialogState === DialogStates.Open;

  let internalDialogRef: HTMLDivElement | null = null;
  $: enabled = dialogState === DialogStates.Open;

  const id = `headlessui-dialog-${useId()}`;

  $: _cleanup = (() => {
    if (_cleanup) {
      _cleanup();
    }
    return useInertOthers(internalDialogRef, enabled);
  })();

  onDestroy(() => {
    if (_cleanup) {
      _cleanup();
    }
  });

  let titleId: StateDefinition["titleId"];

  let api = writable<StateDefinition>({
    titleId,
    dialogState,
    setTitleId(id?: string) {
      if (titleId === id) return;
      titleId = id;
    },
    close() {
      dispatch("close", false);
    },
  });
  setContext(DIALOG_CONTEXT_NAME, api);
  $: api.update((obj) => {
    return {
      ...obj,
      titleId,
      dialogState,
    };
  });

  // Handle outside click
  async function handleWindowMousedown(event: MouseEvent) {
    let target = event.target as HTMLElement;

    if (dialogState !== DialogStates.Open) return;
    if (containers.size !== 1) return;
    if (contains(containers, target)) return;

    $api.close();
    await tick();
    target?.focus();
  }

  // Handle `Escape` to close
  function handleWindowKeydown(event: KeyboardEvent) {
    if (event.key !== Keys.Escape) return;
    if (dialogState !== DialogStates.Open) return;
    if (containers.size > 1) return; // 1 is myself, otherwise other elements in the Stack
    event.preventDefault();
    event.stopPropagation();
    $api.close();
  }

  let mounted = false;
  onMount(() => (mounted = true));
  $: _cleanupScrollLock = (() => {
    if (_cleanupScrollLock) {
      _cleanupScrollLock();
    }
    if (dialogState !== DialogStates.Open) return;
    if (!mounted) return;

    let overflow = document.documentElement.style.overflow;
    let paddingRight = document.documentElement.style.paddingRight;

    let scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.documentElement.style.overflow = overflow;
      document.documentElement.style.paddingRight = paddingRight;
    };
  })();
  onDestroy(() => {
    if (_cleanupScrollLock) {
      _cleanupScrollLock();
    }
  });

  $: _cleanupClose = (() => {
    if (_cleanupClose) {
      _cleanupClose();
    }
    if (dialogState !== DialogStates.Open) return;
    let container = internalDialogRef;
    if (!container) return;

    let observer = new IntersectionObserver((entries) => {
      for (let entry of entries) {
        if (
          entry.boundingClientRect.x === 0 &&
          entry.boundingClientRect.y === 0 &&
          entry.boundingClientRect.width === 0 &&
          entry.boundingClientRect.height === 0
        ) {
          $api.close();
        }
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  })();
  onDestroy(() => {
    if (_cleanupClose) {
      _cleanupClose();
    }
  });

  function handleClick(e: CustomEvent) {
    let event = e as any as MouseEvent;
    event.stopPropagation();
  }

  $: propsWeControl = {
    id,
    role: "dialog",
    "aria-modal": dialogState === DialogStates.Open ? true : undefined,
    "aria-labelledby": titleId,
  };

  $: slotProps = { open };
</script>

<svelte:window
  on:mousedown={handleWindowMousedown}
  on:keydown={handleWindowKeydown}
/>
<FocusTrap {containers} {enabled} options={{ initialFocus }} />
<StackContextProvider
  element={internalDialogRef}
  onUpdate={(message, element) => {
    return match(message, {
      [StackMessage.Add]() {
        containers = new Set([...containers, element]);
      },
      [StackMessage.Remove]() {
        containers.delete(element);
        containers = new Set([...containers]);
      },
    });
  }}
>
  <ForcePortalRootContext force={true}>
    <Portal>
      <PortalGroup target={internalDialogRef}>
        <ForcePortalRootContext force={false}>
          <DescriptionProvider
            name={"DialogDescription"}
            {slotProps}
            let:describedby
          >
            <Render
              {...{ ...$$restProps, ...propsWeControl }}
              {as}
              {slotProps}
              use={[...use, forwardEvents]}
              name={"Dialog"}
              bind:el={internalDialogRef}
              aria-describedby={describedby}
              on:click={handleClick}
              {visible}
              features={Features.RenderStrategy | Features.Static}
            >
              <slot {...slotProps} />
            </Render>
          </DescriptionProvider>
        </ForcePortalRootContext>
      </PortalGroup>
    </Portal>
  </ForcePortalRootContext>
</StackContextProvider>
