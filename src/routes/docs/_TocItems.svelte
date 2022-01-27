<script lang="ts" context="module">
  export interface TocItem {
    id: string;
    url: string;
    title: string;
    headingLevel: number;
    items?: TocItem[];
  }
</script>

<script lang="ts">
  export let items: TocItem[] = [];
  export let activeId: string | undefined;
</script>

<ol class="pl-4">
  {#each items as item (item.url)}
    <li>
      <a href={item.url} class:active={item.id === activeId}>{item.title}</a>
      {#if item.items}
        <svelte:self items={item.items} {activeId} />
      {/if}
    </li>
  {/each}
</ol>

<style lang="postcss">
  .active {
    @apply font-bold;
  }
</style>
