<script>
  import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Transition,
  } from "$lib";
</script>

<div class="flex justify-center w-screen h-full p-12 bg-gray-50">
  <div class="w-full max-w-xs mx-auto">
    <Disclosure>
      <DisclosureButton>Trigger</DisclosureButton>

      <Transition
        enter="transition duration-1000 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-1000 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <DisclosurePanel class="p-4 bg-white mt-4">Content</DisclosurePanel>
      </Transition>
    </Disclosure>
  </div>
</div>
