<script lang="ts">
  import TableOfContents from "./_TableOfContents.svelte";
  import { page } from "$app/stores";

  let el: HTMLElement | null = null;
</script>

<svelte:head>
  <link rel="stylesheet" href="/prism-ghcolors.css" />
</svelte:head>

<div class="flex">
  <div class="w-64 lg:block">
    <nav title="Components" class="sticky top-4">
      <a href="menu">Menu</a>
    </nav>
  </div>
  <article class="prose" bind:this={el}>
    <slot />
  </article>
  <div class="w-80 text-sm lg:block">
    <div class="sticky top-4">
      {#key $page}
        <TableOfContents {el} />
      {/key}
    </div>
  </div>
</div>
