<script lang="ts">
  import { ActionArray, useActions } from "$lib/hooks/use-actions";
  import { get_current_component } from "svelte/internal";
  import { forwardEventsBuilder } from "../forwardEventsBuilder";

  export let use: ActionArray = [];
  export let el: HTMLLabelElement | null = null;
  const forwardEvents = forwardEventsBuilder(get_current_component());
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label bind:this={el} use:useActions={use} use:forwardEvents {...$$restProps}>
  <slot />
</label>
