<script lang="ts">
  import { Transition } from "$lib";
  import Box from "../_Box.svelte";

  let isOpen = false;
</script>

<div class="flex justify-center w-screen h-full p-12 bg-gray-50">
  <div class="space-y-2 w-96">
    <span class="inline-flex rounded-md shadow-sm">
      <button
        type="button"
        on:click={() => (isOpen = !isOpen)}
        class="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-700 transition bg-white border border-gray-300 rounded-md duration-150-out hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50"
      >
        {isOpen ? "Hide" : "Show"}
      </button>
    </span>

    <Transition show={isOpen} unmount={true}>
      <Box>
        <Box>
          <Box>
            <Box />
          </Box>
          <Box>
            <Box>
              <Box>
                <Box />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Transition>
  </div>
</div>
