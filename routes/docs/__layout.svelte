<script lang="ts">
	import {page} from '$app/stores';
	import {classNames} from '$site/lib/helpers';

	import Toc from '$site/components/Toc.svelte';

	let el: HTMLElement;

	const pages = [
		{
			links: [{href: '', label: 'Home'}]
		},
		{
			title: 'Components',
			links: [
				{href: 'menu', label: 'Menu (Dropdown)'},
				{href: 'listbox', label: 'Listbox (Select)'},
				{href: 'switch', label: 'Switch (Toggle)'},
				{href: 'disclosure', label: 'Disclosure'},
				{href: 'dialog', label: 'Dialog (Modal)'},
				{href: 'popover', label: 'Popover'},
				{href: 'radio-group', label: 'Radio Group'},
				{href: 'transition', label: 'Transition'},
				{href: 'tabs', label: 'Tabs'},
			]
		}
	]

	$: active = (href: string): boolean => {
		const path = $page.path.split('/')[2];
		return path === href || !href && !path;
	}
</script>

<template>
	<div class="flex flex-col min-h-screen">
		<div class="flex-grow">
			<div class={classNames(
				'max-w-screen-2xl mx-auto px-5 py-12',
				'grid grid-cols-[250px,1fr,250px] gap-16 items-start'
			)}>
				<nav class="sticky top-6">
					{#each pages as {title, links}}
						{#if title}
							<h4 class="ml-4 text-xs uppercase font-black mb-2 text-gray-500 select-none">{title}</h4>
						{/if}
						<ul class="mb-6">
							{#each links as {href, label}}
								<a
									href="/docs/{href}"
									class={classNames(
										'block px-4 py-3 text-sm rounded-md mb-1 last:mb-0',
										active(href) ? 'text-svelte-light bg-svelte-light/10' : 'hover:bg-gray-300 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white'
									)}
								>
									{label}
								</a>
							{/each}
						</ul>
					{/each}
				</nav>
				<article
					bind:this={el}
					class={classNames(
						'max-w-full w-full prose-invert min-w-0',
						'prose:min-w-0 prose-pre:w-full prose-pre:overflow-auto',
						'prose prose-a:text-svelte hover:prose-a:text-svelte-light prose-blockquote:text-sm',
						'prose-p:text-gray-400 prose-ul:text-gray-400',
						'prose-tr:flex prose-th:flex-1 prose-td:flex-1',
						'prose-hr:border-gray-800',
						'prose-td:text-gray-400 prose-tr:border-gray-700 prose-thead:border-gray-700',
						'prose-blockquote:text-gray-400 prose-blockquote:border-gray-600',
						'prose-h1:text-5xl prose-h2:text-3xl prose-h3:text-2xl'
					)}
				>
					<slot />	
				</article>
				<aside class="sticky top-6">
					<h4 class="text-xs font-black uppercase mb-4">On this page</h4>
					<ul>
						<Toc {el} />
					</ul>
				</aside>
			</div>
		</div>
		<footer class="py-16 mt-8 border-t border-t-gray-800 max-w-screen-2xl mx-auto w-full flex justify-between">
			<a href="https://github.com/rgossiaux/svelte-headlessui" target="_blank" rel="noreferrer" class="w-5 h-5 opacity-50 hover:opacity-100">
				<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
			</a>
			<a
				href="https://github.com/rgossiaux/svelte-headlessui/blob/master/src/routes/docs/{$page.path.split('/')[2] ? `${$page.path.split('/')[2]}/index` : 'index'}.md"
				class="text-sm opacity-50 hover:opacity-100"
				target="_blank"
				rel="noreferrer"
			>
				Edit this page
			</a>
		</footer>
	</div>
</template>