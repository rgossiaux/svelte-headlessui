<script lang="ts">
  import {
    Combobox,
    ComboboxButton,
    ComboboxInput, ComboboxOption, ComboboxOptions, Transition
  } from "$lib";

  import { CheckIcon, SelectorIcon } from "@rgossiaux/svelte-heroicons/solid";

  const people = [
    { id: 1, name: "Wade Cooper" },
    { id: 2, name: "Arlene Mccoy" },
    { id: 3, name: "Devon Webb" },
    { id: 4, name: "Tom Cook" },
    { id: 5, name: "Tanya Fox" },
    { id: 6, name: "Hellen Schmidt" },
  ];

  let selected: any = people[0]
  let query = "";
  
  $: filteredPeople =
    query === ""
      ? people
      : people.filter((person) =>
          person.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  function displayByName(person: typeof people[number]) : string {
    return person?.name;
  }

  function handleInputChange(e: Event) {
    const event = e as any
    query = event.detail;
  }
</script>

<div class="fixed top-16 w-72">  
  <Combobox value={selected} on:change={(e) => (selected = e.detail)}>
    <div class="relative mt-1">
      <div
        class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
      >
        <ComboboxInput
          class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
          displayValue={displayByName}
          on:change={handleInputChange}
        />
        <ComboboxButton
          class="absolute inset-y-0 right-0 flex items-center pr-2"
        >
          <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>
      </div>
      <Transition
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        on:afterLeave={(e) => (query = "")}
      >
        <ComboboxOptions
          class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          {#if filteredPeople.length === 0 && query !== ""}
            <div
              class="relative cursor-default select-none py-2 px-4 text-gray-700"
            >
              Nothing found.
            </div>
          {/if}

          {#each filteredPeople as person, idx (person)}
            <ComboboxOption value={person} let:selected let:active>
              <li
                class={`relative cursor-default select-none py-2 pl-10 pr-4 ${
                  active ? "bg-teal-600 text-white" : "text-gray-900"
                }`}
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
                    class={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                      active ? "text-white" : "text-teal-600"
                    }`}
                  >
                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                  </span>
                {/if}
              </li>
            </ComboboxOption>
          {/each}
        </ComboboxOptions>
      </Transition>
    </div>
  </Combobox>
</div>
