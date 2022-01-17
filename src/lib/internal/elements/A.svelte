<script lang="ts">
  import type { ActionArray } from "$lib/hooks/use-actions";
  import { useActions } from "$lib/hooks/use-actions";
  import { get_current_component } from "svelte/internal";
  import { forwardEventsBuilder } from "../forwardEventsBuilder";

  export let use: ActionArray = [];
  export let el: HTMLAnchorElement | null = null;
  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let href = "javascript:void(0);";
</script>

<a
  bind:this={el}
  use:useActions={use}
  use:forwardEvents
  {href}
  {...$$restProps}
>
  <slot />
</a>
