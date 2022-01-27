<script lang="ts">
  import { createRunWithCleanup } from "$lib/utils/run-with-cleanup";
  import { onMount } from "svelte";
  import TocItems, { type TocItem } from "./_TocItems.svelte";

  export let el: HTMLElement | null;

  let runWithCleanup = createRunWithCleanup();
  let activeId: string | undefined;
  let items: TocItem[] = [];

  let observer: IntersectionObserver | null = null;
  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
          }
        });
      },
      { rootMargin: `0% 0% -80% 0%` }
    );
  });

  function generateItems(root: HTMLElement) {
    let headings = Array.from(root.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    let newItems: TocItem[] = [];
    for (const heading of headings) {
      let headingLevel = parseInt(heading.tagName[1]);
      const newItem = {
        headingLevel,
        id: heading.id,
        url: "#" + heading.id,
        title: heading.textContent || "",
      };
      let parentItems: TocItem[] = newItems;
      while (
        parentItems.length > 0 &&
        parentItems[parentItems.length - 1].headingLevel < headingLevel
      ) {
        let child = parentItems[parentItems.length - 1];
        child.items = child.items || [];
        parentItems = child.items;
      }
      parentItems.push(newItem);
    }
    return newItems;
  }

  $: items = el ? generateItems(el) : [];

  function flattenItems(itemList?: TocItem[]) {
    let result: TocItem[] = [];
    if (!itemList) {
      return result;
    }
    for (let item of itemList) {
      result = result.concat(result, [item], flattenItems(item.items));
    }
    return result;
  }
  $: runWithCleanup(() => {
    if (!observer) {
      return;
    }
    let ids = flattenItems(items).map((item) => item.id);
    ids.forEach((id) => {
      let element = document.getElementById(id);
      if (element) {
        observer!.observe(element);
      }
    });
    return () => {
      ids.forEach((id) => {
        let element = document.getElementById(id);
        if (element) {
          observer!.unobserve(element);
        }
      });
    };
  }, "observer");
</script>

<nav>
  <TocItems {items} {activeId} />
</nav>
