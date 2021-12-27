<script	lang="ts">
	import prism from 'prismjs';
	import 'prism-svelte';

	export let code: string;

	let toggle: boolean = false;
	let expand: boolean = false;

	$: typeof window !== 'undefined' && (expand ? document.body.classList.add('overflow-hidden') : document.body.classList.remove('overflow-hidden'))
</script>

<template>
	<div>
		{#if expand}
			<div class="fixed inset-0 bg-black/60 z-10" on:click={() => expand = false}></div>
		{/if}
		<div class="overflow-hidden bg-gray-800 rounded-lg shadow-xl {expand ? 'fixed inset-12 z-20' : 'relative'}">
			<header class="flex justify-between border-b border-gray-700 bg-gray-800 relative z-10">
				<div class="flex">
					<button
						class="p-3 font-semibold hover:bg-white/5 {!toggle ? 'shadow-[inset_0_-2px_0] shadow-svelte' : ''}"
						on:click={() => toggle = false}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
					</button>
					<button
						class="p-3 font-semibold hover:bg-white/5 {toggle ? 'shadow-[inset_0_-2px_0] shadow-svelte' : ''}"
						on:click={() => toggle = true}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
						</svg>
					</button>
				</div>
				<button
					class="p-3 font-semibold hover:bg-white/5"
					on:click={() => expand = !expand}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
					</svg>
				</button>
			</header>
			{#if !toggle}
				<div class="not-prose p-10 flex flex-col items-center {expand ? 'h-[calc(100vh-3rem-92px)]' : 'h-96'}">
					<div>
						<slot />
					</div>
				</div>
			{:else}
				<pre class="my-0 flex-grow rounded-t-none {expand ? 'h-[calc(100vh-3rem-92px)]' : 'max-h-96'}">
					<code class="language-svelte">
						{@html prism.highlight(code.replace(/\$lib/, '@rgossiaux/svelte-headlessui'), prism.languages['svelte'], 'svelte')}
					</code>
				</pre>
			{/if}
		</div>
	</div>
</template>