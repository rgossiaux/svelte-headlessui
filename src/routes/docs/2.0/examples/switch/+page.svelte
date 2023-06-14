<script lang="ts">
  import { Switch } from "$lib";

  let checked = false;
</script>

<div class="py-16">
  <Switch
    bind:checked
    class={`${checked ? "bg-teal-900" : "bg-teal-700"}
          relative inline-flex flex-shrink-0 h-[38px] w-[74px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
  >
    <span class="sr-only">Use setting</span>
    <span
      aria-hidden="true"
      class={`${checked ? "translate-x-9" : "translate-x-0"}
            pointer-events-none inline-block h-[34px] w-[34px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
    />
  </Switch>
</div>
