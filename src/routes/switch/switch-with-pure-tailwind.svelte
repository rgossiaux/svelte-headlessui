<script lang="ts">
  import { Switch, SwitchGroup, SwitchLabel } from "$lib";

  function classNames(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(" ");
  }

  let state = false;
</script>

<div class="flex items-start justify-center w-screen h-full p-12 bg-gray-50">
  <SwitchGroup as="div" class="flex items-center space-x-4">
    <SwitchLabel>Enable notifications</SwitchLabel>

    <Switch
      as="button"
      bind:checked={state}
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
</div>
