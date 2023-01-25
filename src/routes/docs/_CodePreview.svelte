<script lang="ts" context="module">
  export enum PreviewModes {
    Preview,
    Code,
  }
</script>

<script lang="ts">
  let _class = "";
  export { _class as class };
  export let source: string | undefined;

  let containerEl: HTMLDivElement;
  let iframeEl: HTMLIFrameElement;
  let mode: PreviewModes = PreviewModes.Preview;
  let copied = false;

  function changeMode(newMode: PreviewModes) {
    mode = newMode;
  }

  async function copySource() {
    try {
      await navigator.clipboard.writeText(source);

      copied = true;

      setTimeout(() => {
        copied = false;
      }, 1000);
    } catch (e) {}
  }

  $: sourceHeight = containerEl?.offsetHeight;
</script>

<div bind:this={containerEl} class="relative">
  <div class="absolute inset-x-0 top-0 z-10 m-[2px] md:left-auto">
    <div
      class=" flex items-stretch justify-end rounded-t-[10px] px-2 py-1 md:m-1 md:rounded-lg"
    >
      <button
        class="bg-black bg-opacity-20 mr-1 flex rounded-md px-3 py-2 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-50"
        on:click={(e) => changeMode(PreviewModes.Preview)}>Preview</button
      ><button
        class="bg-black bg-opacity-0 hover:bg-opacity-[0.05] flex rounded-md px-3 py-2 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-50"
        on:click={(e) => changeMode(PreviewModes.Code)}>Code</button
      >
      <div class="my-2 mx-1 w-[2px] grow-0 bg-black bg-opacity-10" />
      <button
        class="bg-black bg-opacity-0 hover:bg-opacity-[0.05] relative rounded-md px-4 py-2 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-50"
        on:click={copySource}
        ><span class:opacity-0={copied}>Copy</span>
        <span
          class="absolute inset-0 flex items-center justify-center"
          class:opacity-0={!copied}
          class:opacity-100={copied}>Copied!</span
        ></button
      >
    </div>
  </div>

  {#if mode == PreviewModes.Preview}
    <iframe
      bind:this={iframeEl}
      data-why
      title="Hello"
      class={_class}
      src="/docs/examples"
    >
      <slot />
    </iframe>
  {:else if mode == PreviewModes.Code}
    <pre style="height:{sourceHeight}px">{source}</pre>
  {/if}
</div>
