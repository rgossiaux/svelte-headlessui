<script lang="ts">
  import { Transition } from "$lib";

  let isOpen = false;
</script>

<div class="flex justify-center w-screen h-full p-12 bg-gray-50">
  <div class="space-y-2 w-96">
    <span class="inline-flex rounded-md shadow-sm">
      <button
        type="button"
        on:click={() => (isOpen = !isOpen)}
        class="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50"
      >
        {isOpen ? "Hide" : "Show"}
      </button>
    </span>

    <Transition
      show={isOpen}
      unmount={false}
      enter="transition ease-out duration-300"
      enterFrom="transform opacity-0"
      enterTo="transform opacity-100"
      leave="transition ease-in duration-300"
      leaveFrom="transform opacity-100"
      leaveTo="transform opacity-0"
      class="p-4 bg-white rounded-md shadow"
    >
      Contents to show and hide
    </Transition>
  </div>
</div>
