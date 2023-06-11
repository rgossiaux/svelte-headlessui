<script lang="ts">
  import { Transition } from "$lib";

  let isShowing = true;
  function resetIsShowing() {
    isShowing = false;
    setTimeout(() => (isShowing = true), 500);
  }
</script>

<div class="flex flex-col items-center py-16">
  <div class="w-32 h-32">
    <Transition
      show={isShowing}
      enter="transform transition duration-[400ms]"
      enterFrom="opacity-0 rotate-[-120deg] scale-50"
      enterTo="opacity-100 rotate-0 scale-100"
      leave="transform duration-200 transition ease-in-out"
      leaveFrom="opacity-100 rotate-0 scale-100 "
      leaveTo="opacity-0 scale-95 "
      class="w-full h-full bg-white rounded-md shadow-lg"
    />
  </div>

  <button
    on:click={resetIsShowing}
    class="flex items-center px-3 py-2 mt-8 text-sm font-medium text-white transition transform bg-black rounded-full backface-visibility-hidden active:bg-opacity-40 hover:scale-105 hover:bg-opacity-30 focus:outline-none bg-opacity-20"
  >
    <svg viewBox="0 0 20 20" fill="none" class="w-5 h-5 opacity-70">
      <path
        d="M14.9497 14.9498C12.2161 17.6835 7.78392 17.6835 5.05025 14.9498C2.31658 12.2162 2.31658 7.784 5.05025 5.05033C7.78392 2.31666 12.2161 2.31666 14.9497 5.05033C15.5333 5.63385 15.9922 6.29475 16.3266 7M16.9497 2L17 7H16.3266M12 7L16.3266 7"
        stroke="currentColor"
        stroke-width="1.5"
      />
    </svg>

    <span class="ml-3">Click to transition</span>
  </button>
</div>
