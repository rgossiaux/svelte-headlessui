<script lang="ts" context="module">
  export enum Features {
    // The default, no features.
    None = 1 << 0,

    // Whether the element should be focusable or not.
    Focusable = 1 << 1,

    // Whether it should be completely hidden, even to assistive technologies.
    Hidden = 1 << 2,
  }
</script>

<script lang="ts">
  import type { SupportedAs } from "$lib/internal/elements";
  import Render from "$lib/utils/Render.svelte";

  export let as: SupportedAs = "div";
  export let features: Features = Features.None;

  $: propsWeControl = {
    "aria-hidden":(features & Features.Focusable) === Features.Focusable ? true : undefined,
    style: `position:fixed;top:1px;left:1px;width:1px;height:0px;padding:0px;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);whitespace:nowrap;border-width:0px;${(features & Features.Hidden) === Features.Hidden && !((features & Features.Focusable) === Features.Focusable) ? 'display:none': ''}`
  };
  
  $: slotProps = {};
</script>

<Render
  elementName={$$restProps.name} 
  style={propsWeControl.style}
  aria-hidden={propsWeControl["aria-hidden"]}
  {...{ ...$$restProps }}
  {as}
  name={"Hidden"}
  {slotProps}
>
  <slot />
</Render>
