<script lang="ts">
  import { Transition, TransitionChild } from "$lib";

  let isOpen = false;
  function toggle() {
    isOpen = !isOpen;
  }

  let email = "";
  let events: string[] = [];
  let inputRef: HTMLElement | null = null;

  function addEvent(name: string) {
    events = [...events, `${new Date().toJSON()} - ${name}`];
  }
</script>

<div>
  <div class="flex p-12 space-x-4">
    <div class="inline-block p-12">
      <span class="flex w-full mt-3 rounded-md shadow-sm sm:mt-0 sm:w-auto">
        <button
          on:click={toggle}
          type="button"
          class="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue sm:text-sm sm:leading-5"
        >
          Show modal
        </button>
      </span>
    </div>

    <ul class="p-4 text-gray-900 bg-gray-200">
      <h3 class="font-bold">Events:</h3>
      {#each events as event}
        <li class="font-mono text-sm">
          {event}
        </li>
      {/each}
    </ul>
  </div>

  <Transition
    show={isOpen}
    class="fixed inset-0 z-10 overflow-y-auto"
    on:introstart={() => {
      addEvent("Before enter");
    }}
    on:introend={() => {
      inputRef?.focus();
      addEvent("After enter");
    }}
    on:outrostart={() => {
      addEvent("Before leave (before confirm)");
      window.confirm("Are you sure?");
      addEvent("Before leave (after confirm)");
    }}
    on:outroend={(event) => {
      addEvent(`After leave (before alert)`);
      window.alert("Consider it done!");
      addEvent(`After leave (after alert)`);
      email = "";
    }}
  >
    <div
      class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <TransitionChild
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div class="fixed inset-0 transition-opacity">
          <div class="absolute inset-0 bg-gray-500 opacity-75" />
        </div>
      </TransitionChild>
      <!-- This element is to trick the browser into centering the modal contents. -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" />&#8203;
      <TransitionChild
        class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div class="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div
              class="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10"
            >
              <!-- Heroicon name: exclamation -->
              <svg
                class="w-6 h-6 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3
                class="text-lg font-medium leading-6 text-gray-900"
                id="modal-headline"
              >
                Deactivate account
              </h3>
              <div class="mt-2">
                <p class="text-sm leading-5 text-gray-500">
                  Are you sure you want to deactivate your account? All of your
                  data will be permanently removed. This action cannot be
                  undone.
                </p>
              </div>
              <div class="mt-2">
                <div>
                  <label
                    for="email"
                    class="block text-sm font-medium leading-5 text-gray-700"
                  >
                    Email address
                  </label>
                  <div class="relative mt-1 rounded-md shadow-sm">
                    <input
                      bind:this={inputRef}
                      bind:value={email}
                      id="email"
                      class="block w-full px-3 form-input sm:text-sm sm:leading-5"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
          <span class="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
            <button
              type="button"
              class="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-white transition duration-150 ease-in-out bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red sm:text-sm sm:leading-5"
            >
              Deactivate
            </button>
          </span>
          <span class="flex w-full mt-3 rounded-md shadow-sm sm:mt-0 sm:w-auto">
            <button
              on:click={toggle}
              type="button"
              class="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue sm:text-sm sm:leading-5"
            >
              Cancel
            </button>
          </span>
        </div>
      </TransitionChild>
    </div>
  </Transition>
</div>
