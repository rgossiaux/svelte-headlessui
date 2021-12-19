<script>
  import { TransitionChild } from "$lib";
</script>

<TransitionChild
  unmount={false}
  enter="transition translate duration-300"
  enterFrom="transform -translate-x-full"
  enterTo="transform translate-x-0"
  leave="transition translate duration-300"
  leaveFrom="transform translate-x-0"
  leaveTo="transform translate-x-full"
>
  <div
    class="p-4 space-y-2 text-sm font-semibold tracking-wide text-gray-700 uppercase bg-white rounded-md shadow"
  >
    <span>This is a box</span>
    <slot />
  </div>
</TransitionChild>
