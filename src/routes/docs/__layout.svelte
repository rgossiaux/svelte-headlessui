<svelte:head>
  <link rel="stylesheet" href="/prism-ghcolors.css" />
</svelte:head>

<div class="flex">
  <div class="w-64 lg:block">
    <nav title="Components" class="sticky top-4">
      <a href="menu">Menu</a>
    </nav>
  </div>
  <article class="prose">
    <slot />
  </article>
</div>
