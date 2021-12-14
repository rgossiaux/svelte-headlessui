<script lang="ts">
  import { usePortalGroupContext } from "./PortalGroup.svelte";
  import { usePortalRoot } from "$lib/internal/ForcePortalRootContext.svelte";
  import { portal } from "$lib/hooks/use-portal";
  let forceInRoot = usePortalRoot();
  let groupTarget = usePortalGroupContext();
  let target = (() => {
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
    return document.body.appendChild(root);
  })();
</script>

<div use:portal={target}>
  <slot />
</div>
