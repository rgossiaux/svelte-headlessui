<script lang="ts">
  import { Disclosure, DisclosureButton, DisclosurePanel } from "$lib";
  import { ChevronUpIcon } from "@rgossiaux/svelte-heroicons/solid";
</script>

<div class="w-full px-4 pt-16">
  <div class="w-full max-w-md p-2 mx-auto bg-white rounded-2xl">
    <Disclosure let:open>
      <DisclosureButton
        class="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
      >
        <span>What is your refund policy?</span>
        <ChevronUpIcon
          class={`${
            open ? "transform rotate-180" : ""
          } w-5 h-5 text-purple-500`}
        />
      </DisclosureButton>
      <DisclosurePanel class="px-4 pt-4 pb-2 text-sm text-gray-500">
        If you're unhappy with your purchase for any reason, email us within 90
        days and we'll refund you in full, no questions asked.
      </DisclosurePanel>
    </Disclosure>
    <Disclosure as="div" class="mt-2" let:open>
      <DisclosureButton
        class="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
      >
        <span>Do you offer technical support?</span>
        <ChevronUpIcon
          class={`${
            open ? "transform rotate-180" : ""
          } w-5 h-5 text-purple-500`}
        />
      </DisclosureButton>
      <DisclosurePanel class="px-4 pt-4 pb-2 text-sm text-gray-500">
        No.
      </DisclosurePanel>
    </Disclosure>
  </div>
</div>
