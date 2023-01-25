<script lang="ts">
  import PeopleList from "../_PeopleList.svelte";
</script>

<div class="flex justify-center w-screen h-full p-12 space-x-4 bg-gray-50">
  <PeopleList />

  <div>
    <label
      for="email"
      class="block text-sm font-medium leading-5 text-gray-700"
    >
      Email
    </label>
    <div class="relative mt-1 rounded-md shadow-sm">
      <input
        class="block w-full form-input sm:text-sm sm:leading-5"
        placeholder="you@example.com"
      />
    </div>
  </div>

  <PeopleList />
</div>
