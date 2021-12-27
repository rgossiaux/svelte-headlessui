<script lang="ts" context="module">
  export enum StackMessage {
    Add,
    Remove,
  }

  const STACK_CONTEXT_NAME = "headlessui-stack-context";
</script>

<script lang="ts">
  import { getContext, onDestroy, setContext } from "svelte";
  type OnUpdate = (message: StackMessage, element: HTMLElement) => void;

  export let onUpdate: OnUpdate | undefined;
  export let element: HTMLElement | null;

  function notify(...args: Parameters<OnUpdate>) {
    // Notify our layer
    onUpdate?.(...args);

    // Notify the parent
    parentUpdate?.(...args);
  }

  let parentUpdate: OnUpdate | undefined = getContext(STACK_CONTEXT_NAME);
  setContext(STACK_CONTEXT_NAME, notify);

  $: _cleanup = (() => {
    if (_cleanup) {
      _cleanup();
    }
    if (!element) return null;
    let savedElement = element;
    notify(StackMessage.Add, savedElement);
    return () => notify(StackMessage.Remove, savedElement);
  })();

  onDestroy(() => {
    if (_cleanup) {
      _cleanup();
    }
  });
</script>

<slot />
