<script lang="ts">
  import TableOfContents from "./_TableOfContents.svelte";
  import { page } from "$app/stores";

  let el: HTMLElement | null = null;

  $: isHome = $page.url.pathname.endsWith("docs");
  $: base = isHome ? "docs/" : "";

  $: pages = [
    { url: "../docs", text: "Home" },
    { url: `${base}general-concepts`, text: "General concepts" },
    { url: `${base}tailwind-ui`, text: "Use with Tailwind UI" },
    { url: `${base}version-history`, text: "Version history" },
  ];

  $: components = [
    { url: `${base}dialog`, text: "Dialog" },
    { url: `${base}disclosure`, text: "Disclosure" },
    { url: `${base}listbox`, text: "Listbox" },
    { url: `${base}menu`, text: "Menu" },
    { url: `${base}popover`, text: "Popover" },
    { url: `${base}radio-group`, text: "Radio Group" },
    { url: `${base}switch`, text: "Switch" },
    { url: `${base}tabs`, text: "Tabs" },
    { url: `${base}transition`, text: "Transition" },
  ];
</script>

<svelte:head>
  <link rel="stylesheet" href="/prism-one-light.css" />
</svelte:head>

<div class="flex">
  <div class="w-52 min-w-fit hidden md:block flex-shrink-0">
    <nav title="Pages" class="sticky top-20 ml-6 flex flex-col">
      {#each pages as p (p.url)}
        <a
          href={p.url}
          class:font-bold={$page.url.pathname.includes(p.url)}
          class="py-1 hover:decoration-stone-400 hover:underline">{p.text}</a
        >
      {/each}
      <hr class="w-24 my-4" />
      {#each components as component (component.url)}
        <a
          href={component.url}
          class:font-bold={$page.url.pathname.includes(component.url)}
          class="py-1 hover:decoration-stone-400 hover:underline"
          >{component.text}</a
        >
      {/each}
    </nav>
  </div>
  <article class="prose max-w-3xl min-w-0 mt-5 px-6 pb-8" bind:this={el}>
    <slot />
  </article>
  <div class="w-64 text-sm hidden flex-shrink-0 lg:block">
    <nav
      title="Table of contents"
      class="sticky top-0 pt-20 pb-4 -mt-[61px] max-h-screen overflow-y-auto"
    >
      {#key $page}
        <TableOfContents {el} />
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
  }
</style>
