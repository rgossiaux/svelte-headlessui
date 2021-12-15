<script lang="ts" context="module">
  export enum StackMessage {
    Add,
    Remove,
  }
</script>

<script lang="ts">
  import { getContext, onDestroy, setContext } from "svelte";
  import { writable, Writable } from "svelte/store";
  type OnUpdate = (message: StackMessage, element: HTMLElement) => void;

  export let onUpdate: OnUpdate | undefined;
  export let element: HTMLElement | null;

  let parentUpdateStore: Writable<OnUpdate> | undefined =
    getContext("StackContext");
  let notifyStore: Writable<OnUpdate> = writable(() => {});
  setContext("StackContext", notifyStore);

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
