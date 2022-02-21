<script lang="ts">
  import TableOfContents from "./_TableOfContents.svelte";
  import { page } from "$app/stores";

  let el: HTMLElement | null = null;
</script>

<svelte:head>
  <link rel="stylesheet" href="/prism-one-light.css" />
</svelte:head>

<div class="flex">
  <div class="w-64 lg:block">
    <nav title="Components" class="sticky top-4 flex flex-col">
      <a href="dialog">Dialog</a>
      <a href="disclosure">Disclosure</a>
      <a href="listbox">Listbox</a>
      <a href="menu">Menu</a>
      <a href="popover">Popover</a>
      <a href="radio-group">Radio Group</a>
      <a href="switch">Switch</a>
      <a href="tabs">Tabs</a>
      <a href="transition">Transition</a>
    </nav>
  </div>
  <article class="prose max-w-3xl" bind:this={el}>
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
