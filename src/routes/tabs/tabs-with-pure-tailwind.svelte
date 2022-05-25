<script lang="ts">
  import {
    Switch,
    SwitchGroup,
    SwitchLabel,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
  } from "$lib";

  function classNames(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(" ");
  }

  let tabs = [
    { name: "My Account", content: "Tab content for my account" },
    { name: "Company", content: "Tab content for company", disabled: true },
    { name: "Team Members", content: "Tab content for team members" },
    { name: "Billing", content: "Tab content for billing" },
  ];

  let manual = false;
</script>

<div
  class="flex flex-col items-start w-screen h-full p-12 bg-gray-50 space-y-12"
>
  <SwitchGroup as="div" class="flex items-center space-x-4">
    <SwitchLabel>Manual keyboard activation</SwitchLabel>

    <Switch
      as="button"
      bind:checked={manual}
      class={({ checked }) =>
        classNames(
          "relative inline-flex flex-shrink-0 h-6 border-2 border-transparent rounded-full cursor-pointer w-11 focus:outline-none focus:shadow-outline transition-colors ease-in-out duration-200",
          checked ? "bg-indigo-600" : "bg-gray-200"
        )}
      let:checked
    >
      <span
        class={classNames(
          "inline-block w-5 h-5 bg-white rounded-full transform transition ease-in-out duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </Switch>
  </SwitchGroup>

  <TabGroup class="flex flex-col max-w-3xl w-full" as="div" {manual}>
    <TabList
      class="relative z-0 rounded-lg shadow flex divide-x divide-gray-200"
    >
      {#each tabs as tab, tabIdx (tab.name)}
        <Tab
          disabled={tab.disabled}
          class={({ selected }) =>
            classNames(
              selected ? "text-gray-900" : "text-gray-500 hover:text-gray-700",
              tabIdx === 0 ? "rounded-l-lg" : "",
              tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
              tab.disabled && "opacity-50",
              "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10"
            )}
          let:selected
        >
          <span>{tab.name}</span>
          {#if tab.disabled}
            <small class="inline-block px-4 text-xs">(disabled)</small>
          {/if}
          <span
            aria-hidden="true"
            class={classNames(
              selected ? "bg-indigo-500" : "bg-transparent",
              "absolute inset-x-0 bottom-0 h-0.5"
            )}
          />
        </Tab>
      {/each}
    </TabList>

    <TabPanels class="mt-4">
      {#each tabs as tab (tab.name)}
        <TabPanel class="bg-white rounded-lg p-4 shadow">
          {tab.content}
        </TabPanel>
      {/each}
    </TabPanels>
  </TabGroup>
</div>
