<script lang="ts" context="module">
  export enum StackMessage {
    Add,
    Remove,
  }

  const STACK_CONTEXT_NAME = "headlessui-stack-context";
</script>

<script lang="ts">
  import { getContext, onDestroy, setContext } from "svelte";
  import { Readable, writable, Writable } from "svelte/store";
  type OnUpdate = (message: StackMessage, element: HTMLElement) => void;

  export let onUpdate: OnUpdate | undefined;
  export let element: HTMLElement | null;

  let parentUpdateStore: Readable<OnUpdate> | undefined =
    getContext(STACK_CONTEXT_NAME);
  let notifyStore: Writable<OnUpdate> = writable(() => {});
  setContext(STACK_CONTEXT_NAME, notifyStore);

  $: notifyStore.set((...args: Parameters<OnUpdate>) => {
    // Notify our layer
    onUpdate?.(...args);

    // Notify the parent
    $parentUpdateStore?.(...args);
  });

  $: _cleanup = (() => {
    if (_cleanup) {
      _cleanup();
    }
    if (!element) return null;
    let savedElement = element;
    $notifyStore(StackMessage.Add, savedElement);
    return () => $notifyStore(StackMessage.Remove, savedElement);
  })();

  onDestroy(() => {
    if (_cleanup) {
      _cleanup();
    }
  });
</script>

<slot />
