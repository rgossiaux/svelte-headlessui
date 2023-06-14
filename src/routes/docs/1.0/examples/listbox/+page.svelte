<script lang="ts">
  import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    Transition,
  } from "$lib";
  import { CheckIcon, SelectorIcon } from "@rgossiaux/svelte-heroicons/solid";

  const people = [
    { name: "Wade Cooper" },
    { name: "Arlene Mccoy" },
    { name: "Devon Webb" },
    { name: "Tom Cook" },
    { name: "Tanya Fox" },
    { name: "Hellen Schmidt" },
  ];

  let selected = people[0];
</script>

<div class="w-72 fixed top-16">
  <Listbox bind:value={selected}>
    <div class="relative mt-1">
      <ListboxButton
        class="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
      >
        <span class="block truncate">{selected.name}</span>
        <span
          class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
        >
          <SelectorIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>
      <Transition
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <ListboxOptions
          class="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          {#each people as person, personIdx (personIdx)}
            <ListboxOption
              class={({ active }) =>
                `cursor-default select-none relative py-2 pl-10 pr-4 ${
                  active ? "text-amber-900 bg-amber-100" : "text-gray-900"
                }`}
              value={person}
              let:selected
            >
              <span
                class={`block truncate ${
                  selected ? "font-medium" : "font-normal"
                }`}
              >
                {person.name}
              </span>
              {#if selected}
                <span
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
                >
                  <CheckIcon class="w-5 h-5" aria-hidden="true" />
                </span>
              {/if}
            </ListboxOption>
          {/each}
        </ListboxOptions>
      </Transition>
    </div>
  </Listbox>
</div>
