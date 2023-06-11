<script lang="ts">
  import { createRunWithCleanup } from "$lib/utils/run-with-cleanup";
  import { onMount } from "svelte";
  import TocItems, { type TocItem } from "./_TocItems.svelte";

  export let el: HTMLElement | null;
  export let rootMargin = "0% 0% -80% 0%";

  let runWithCleanup = createRunWithCleanup();
  let activeId: string | undefined;
  let items: TocItem[] = [];
  let idToItem: { [id: string]: TocItem } = {};
  let visibleIds = new Set<string>();

  $: flatItems = flattenItems(items);

  function offsetItemById(id: string, offset: number): TocItem | undefined {
    let item = idToItem[id];
    if (item) {
      return flatItems[item.index + offset];
    }
  }

  function computeActiveId() {
    if (visibleIds.size === 0) {
      activeId = undefined;
      return;
    }
    activeId = Array.from(visibleIds)
      .map((id) => idToItem[id]!)
      .reduce((a, b) => (a.index < b.index ? a : b))?.id;
  }

  let observer: IntersectionObserver | null = null;
  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
            computeActiveId();
          } else if (visibleIds.has(entry.target.id)) {
            visibleIds.delete(entry.target.id);
            if (visibleIds.size > 0) {
              computeActiveId();
            } else {
              let scrollingDown =
                entry.boundingClientRect.y < (entry.rootBounds?.y ?? 0);
              // If scrolling down, this one should remain active: we're still in the contents of it
              //  until we get to the next item below.
              // If scrolling up, we should go to the previous item.
              if (!scrollingDown) {
                activeId = offsetItemById(entry.target.id, -1)?.id;
              }
            }
          }
        });
      },
      { rootMargin }
    );
  });

  function generateItems(root: HTMLElement, ignoreH1 = true) {
    let headings = Array.from(
      root.querySelectorAll(`${ignoreH1 ? "" : "h1, "}h2, h3, h4, h5, h6`)
    );
    let newItems: TocItem[] = [];
    let index = 0;
    for (const heading of headings) {
      let headingLevel = parseInt(heading.tagName[1]);
      const newItem = {
        headingLevel,
        index: index++,
        id: heading.id,
        url: "#" + heading.id,
        title: heading.textContent || "",
      };
      idToItem[newItem.id] = newItem;
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
      result = result.concat([item], flattenItems(item.items));
    }
    return result;
  }

  $: runWithCleanup(() => {
    if (!observer) {
      return;
    }
    let ids = flatItems.map((item) => item.id);
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
