<script lang="ts">
  import { hasOpenClosed } from "$lib/internal/open-closed";
  import TransitionChild from "./TransitionChild.svelte";
  import TransitionRoot, {
    type TTransitionRootProps,
  } from "./TransitionRoot.svelte";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { get_current_component } from "svelte/internal";
  import type { SupportedAs } from "$lib/internal/elements";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { hasTransitionContext } from "./common.svelte";
  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "beforeEnter",
    "beforeLeave",
    "afterEnter",
    "afterLeave",
  ]);

  /***** Props *****/

  type $$Props = TTransitionRootProps;

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  /***** Events *****/

  /***** Component *****/
  let hasTransition = hasTransitionContext();
  let hasOpen = hasOpenClosed();
</script>

{#if !hasTransition && hasOpen}
  <TransitionRoot
    {...$$props}
    {as}
    use={[...use, forwardEvents]}
    on:afterEnter
    on:afterLeave
    on:beforeEnter
    on:beforeLeave
  >
    <slot />
  </TransitionRoot>
{:else}
  <TransitionChild
    {...$$props}
    {as}
    use={[...use, forwardEvents]}
    on:afterEnter
    on:afterLeave
    on:beforeEnter
    on:beforeLeave
  >
    <slot />
  </TransitionChild>
{/if}
