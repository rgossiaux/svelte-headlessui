<script lang="ts">
  import {
    Dialog,
    DialogOverlay,
    DialogTitle,
    Transition,
    TransitionChild,
  } from "$lib";

  let isOpen = true;

  function closeModal() {
    isOpen = false;
  }

  function openModal() {
    isOpen = true;
  }
</script>

<div class="fixed inset-0 flex items-center justify-center">
  <button
    type="button"
    on:click={openModal}
    class="px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
  >
    Open dialog
  </button>
</div>

<Transition appear show={isOpen}>
  <Dialog
    as="div"
    class="fixed inset-0 z-10 overflow-y-auto"
    on:close={closeModal}
  >
    <div class="min-h-screen px-4 text-center">
      <TransitionChild
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <DialogOverlay class="fixed inset-0" />
      </TransitionChild>

      <TransitionChild
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>
        <div
          class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
        >
          <DialogTitle
            as="h3"
            class="text-lg font-medium leading-6 text-gray-900"
          >
            Payment successful
          </DialogTitle>
          <div class="mt-2">
            <p class="text-sm text-gray-500">
              Your payment has been successfully submitted. We’ve sent you an
              email with all of the details of your order.
            </p>
          </div>

          <div class="mt-4">
            <button
              type="button"
              class="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              on:click={closeModal}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </TransitionChild>
    </div>
  </Dialog>
</Transition>
