<script lang="ts">
  import type { ActionArray } from "$lib/hooks/use-actions";
  import { useActions } from "$lib/hooks/use-actions";
  import { get_current_component } from "svelte/internal";
  import { forwardEventsBuilder } from "../forwardEventsBuilder";
  export let use: ActionArray = [];
  export let el: HTMLButtonElement | null = null;
  const forwardEvents = forwardEventsBuilder(get_current_component());
</script>

<button bind:this={el} use:useActions={use} use:forwardEvents {...$$restProps}>
  <slot />
</button>
