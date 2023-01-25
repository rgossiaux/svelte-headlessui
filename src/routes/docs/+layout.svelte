<script lang="ts">
  import { page } from "$app/stores";
  import Sidebar from "./_Sidebar.svelte";
  import TableOfContents from "./_TableOfContents.svelte";

  let el: HTMLElement | null = null;

  $: isExample = $page.routeId == "docs/examples";
  
</script>

<svelte:head>
  <link rel="stylesheet" href="/prism-one-light.css" />
</svelte:head>

{#if isExample}
  <slot />
{:else}
  <div class="flex">
    <div class="w-52 min-w-fit hidden md:block flex-shrink-0">
      <div
        class="sticky top-0 pt-20 pb-4 -mt-[61px] max-h-screen overflow-y-auto"
      >
        <Sidebar />
      </div>
    </div>

    <article class="prose max-w-3xl min-w-0 mt-5 px-3 pb-8" bind:this={el}>
      <slot />
    </article>
    <div class="w-64 text-sm hidden flex-shrink-0 lg:block">
      <nav
        title="Table of contents"
        class="sticky top-0 pt-20 pb-4 -mt-[61px] max-h-screen overflow-y-auto"
      >
        {#key $page}
          <TableOfContents {el} rootMargin="-61px 0% -85% 0%" />
        {/key}
      </nav>
    </div>
  </div>
{/if}

<style lang="postcss">
  article {
    :global(h1),
    :global(h2),
    :global(h3),
    :global(h4) {
      @apply before:h-20 before:-mt-20 before:block before:content-[""];

      :global(a) {
        @apply no-underline hover:underline;
      }
    }

    :global(table) {
      @apply mt-8;
    }
  }
</style>
