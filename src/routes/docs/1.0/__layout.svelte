<script lang="ts">
  import TableOfContents from "./_TableOfContents.svelte";
  import { page } from "$app/stores";
  import Sidebar from "./_Sidebar.svelte";
  import MobileSidebar from "./_MobileSidebar.svelte";
  import { MenuAlt2Icon } from "@rgossiaux/svelte-heroicons/outline";

  let sidebarOpen = false;

  let el: HTMLElement | null = null;
</script>

<svelte:head>
  <link rel="stylesheet" href="/prism-one-light.css" />
</svelte:head>

<MobileSidebar bind:sidebarOpen />
<div
  class="sticky top-0 px-6 text-xl text-stone-500 w-full backdrop-blur border-b z-20"
>
  <div class="py-4 pr-4 flex justify-between items-center">
    <div class="flex items-center space-x-4 md:space-x-0">
      <button
        type="button"
        class="pr-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
        on:click={() => (sidebarOpen = true)}
      >
        <span class="sr-only">Open sidebar</span>
        <MenuAlt2Icon class="h-6 w-6" aria-hidden="true" />
      </button>
      <a href="/docs/1.0">
        <span class="text-amber-600">Svelte</span> Headless UI
        <span class="text-base text-red-500">v1.0</span>
      </a>
    </div>
    <a
      href="https://github.com/rgossiaux/svelte-headlessui"
      class="hover:text-black"
    >
      <svg viewBox="0 0 16 16" fill="currentColor" class="w-5 h-5">
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
    </a>
  </div>
</div>

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
