<script lang="ts">
  import {classNames} from '$site/lib/helpers';

  let copiedText: boolean = false;
  const copy = async(): Promise<void> => {
		await navigator.clipboard.writeText('npm install @rgossiaux/svelte-headlessui -D');
		copiedText = true;
		setTimeout(() => copiedText = false, 3000);
	}
</script>

<template>
  <section class="h-screen flex items-center">
    <div class="max-w-screen-xl mx-auto px-5">

      <h1 class="text-6xl font-black leading-[1.35] text-white">A complete port of the HeadlessUI component library, for <span class="text-svelte">Svelte</span>.</h1>
  
      <div class="flex gap-4 mt-20">
        <a href="/docs" class={classNames(
          'font-bold text-white px-6 py-3 rounded-lg transition-colors',
          'bg-svelte hover:bg-svelte-dark',
          'border-2 border-transparent',
          'focus:outline-2 focus:outline focus:outline-offset-2 focus:outline-svelte'
        )}>Get Started</a>
  
        <button
          type="button"
          class={classNames(
            'font-medium px-6 py-3 rounded-lg transition border-2 flex items-center gap-2',
            'bg-gray-800 border-gray-800 hover:border-gray-700',
            'focus:outline-2 focus:outline focus:outline-offset-2 focus:outline-svelte'
          )}
          on:click={copy}
        >
          npm install @rgossiaux/svelte-headlessui -D
          {#if copiedText}
            <small class="ml-1 text-xs font-medium text-gray-500">(copied)</small>
          {/if}
        </button>
      </div>

      <div class="flex items-center-gap-4 mt-10">
        <a href="https://github.com/rgossiaux/svelte-headlessui" target="_blank" rel="noreferrer" class="w-6 h-6 opacity-50 hover:opacity-100">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
        </a>
      </div>

    </div>
  </section>
</template>