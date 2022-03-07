<script lang="ts">
  import { usePortalGroupContext } from "./PortalGroup.svelte";
  import { usePortalRoot } from "$lib/internal/ForcePortalRootContext.svelte";
  import { portal } from "$lib/hooks/use-portal";
  import { tick } from "svelte";
  let forceInRoot = usePortalRoot();
  let groupTarget = usePortalGroupContext();
  $: target = (() => {
    // Group context is used, but still null
    if (
      !(forceInRoot && $forceInRoot) &&
      groupTarget !== undefined &&
      $groupTarget !== null
    )
      return $groupTarget;

    // No group context is used, let's create a default portal root
    if (typeof window === "undefined") return null;
    let existingRoot = document.getElementById("headlessui-portal-root");
    if (existingRoot) return existingRoot;

    let root = document.createElement("div");
    root.setAttribute("id", "headlessui-portal-root");
    // During initial render, the "portal" might be constructed before
    // the root component has even attached, causing the portal to not work.
    // This is a workaround for this issue--it can't guarantee the portal is
    // **always** last, but it should catch the normal cases.
    tick().then(() => {
      if (root !== document.body.lastChild) {
        document.body.appendChild(root);
      }
    });
    return document.body.appendChild(root);
  })();
</script>

<div use:portal={target}>
  <slot />
</div>
