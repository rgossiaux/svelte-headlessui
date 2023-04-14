<script lang="ts">
  import { Dialog, DialogOverlay, Transition, TransitionChild } from "$lib";
  import { XIcon } from "@rgossiaux/svelte-heroicons/outline";
  import Sidebar from "./_Sidebar.svelte";
  export let sidebarOpen = false;
</script>

<Transition show={sidebarOpen}>
  <Dialog
    class="fixed inset-0 flex z-40 md:hidden"
    on:close={() => (sidebarOpen = false)}
  >
    <TransitionChild
      enter="transition-opacity ease-linear duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-linear duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <DialogOverlay class="absolute inset-0 bg-gray-600 bg-opacity-75" />
    </TransitionChild>
    <TransitionChild
      enter="transition ease-in-out duration-300 transform"
      enterFrom="-translate-x-full"
      enterTo="translate-x-0"
      leave="transition ease-in-out duration-300 transform"
      leaveFrom="translate-x-0"
      leaveTo="-translate-x-full"
    >
      <div
        class="relative flex-1 flex flex-col max-w-xs w-full h-full bg-white"
      >
        <TransitionChild
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div class="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              on:click={() => (sidebarOpen = false)}
            >
              <span class="sr-only">Close sidebar</span>
              <XIcon class="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
        </TransitionChild>
        <div class="mt-5 flex-1 h-0 overflow-y-auto">
          <Sidebar />
        </div>
      </div>
    </TransitionChild>
    <div class="flex-shrink-0 w-14" aria-hidden="true">
      <!-- Dummy element to force sidebar to shrink to fit close icon -->
    </div>
  </Dialog>
</Transition>
