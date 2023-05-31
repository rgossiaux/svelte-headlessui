<script>
  import PopoverButton from "$lib/components/popover/PopoverButton.svelte";
</script>

<PopoverButton
  class="px-3 py-2 bg-gray-300 border-2 border-transparent focus:outline-none focus:border-blue-900"
  {...$$restProps}
>
  <slot />
</PopoverButton>
