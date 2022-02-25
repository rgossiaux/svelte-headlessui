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
</script>

<svelte:head>
  <link rel="stylesheet" href="/prism-one-light.css" />
</svelte:head>

<div class="flex">
  <div class="w-52 min-w-fit hidden md:block flex-shrink-0">
    <nav title="Components" class="sticky top-20 ml-6 flex flex-col">
      {#each components as component (component.url)}
        <a
          href={component.url}
          class:font-bold={$page.path.includes(component.url)}
          class="py-1 hover:decoration-stone-400 hover:underline"
          >{component.text}</a
        >
      {/each}
    </nav>
  </div>
  <article class="prose max-w-3xl min-w-0 mt-5 px-6" bind:this={el}>
    <slot />
  </article>
  <div class="w-64 text-sm hidden flex-shrink-0 lg:block">
    <div
      class="sticky top-0 pt-20 pb-4 -mt-[61px] max-h-screen overflow-y-auto"
    >
      {#key $page}
        <TableOfContents {el} />
      {/key}
    </div>
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
  }
</style>
