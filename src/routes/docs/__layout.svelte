<script lang="ts">
  import TableOfContents from "./_TableOfContents.svelte";
  import { page } from "$app/stores";

  let el: HTMLElement | null = null;

  let components = [
    { url: "dialog", text: "Dialog" },
    { url: "disclosure", text: "Disclosure" },
    { url: "listbox", text: "Listbox" },
    { url: "menu", text: "Menu" },
    { url: "popover", text: "Popover" },
    { url: "radio-group", text: "Radio Group" },
    { url: "switch", text: "Switch" },
    { url: "tabs", text: "Tabs" },
    { url: "transition", text: "Transition" },
  ];

  console.log($page);
</script>

<svelte:head>
  <link rel="stylesheet" href="/prism-one-light.css" />
</svelte:head>

<div class="flex">
  <div class="w-52 hidden md:block">
    <nav title="Components" class="sticky top-20 flex flex-col">
      {#each components as component (component.url)}
        <a
          href={component.url}
          class:font-bold={$page.path.includes(component.url)}
          >{component.text}</a
        >
      {/each}
    </nav>
  </div>
  <article class="prose max-w-3xl" bind:this={el}>
    <slot />
  </article>
  <div class="w-80 text-sm hidden lg:block">
    <div class="sticky top-20">
      {#key $page}
        <TableOfContents {el} />
      {/key}
    </div>
  </div>
</div>
