<script>
  import { PopoverButton } from "$lib";
</script>

<PopoverButton
  class="px-3 py-2 bg-gray-300 border-2 border-transparent focus:outline-none focus:border-blue-900"
  {...$$props}
>
  <slot />
</PopoverButton>
