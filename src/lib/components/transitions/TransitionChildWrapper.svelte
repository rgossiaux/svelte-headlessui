<script lang="ts">
  import { hasOpenClosed } from "$lib/internal/open-closed";
  import TransitionChild from "./TransitionChild.svelte";
  import TransitionRoot, {
    hasTransitionContext,
  } from "./TransitionRoot.svelte";

  let hasTransition = hasTransitionContext();
  let hasOpen = hasOpenClosed();
</script>

{#if !hasTransition && hasOpen}
  <TransitionRoot
    {...$$props}
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
    on:afterEnter
    on:afterLeave
    on:beforeEnter
    on:beforeLeave
  >
    <slot />
  </TransitionChild>
{/if}
