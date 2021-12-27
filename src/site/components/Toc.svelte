<script lang="ts">
	import {page} from '$app/stores';
	import {classNames} from '../lib/helpers';

	export let el: HTMLElement;

	let headings: HTMLHeadingElement[];
	let active: HTMLHeadingElement;

	$: $page, headings = el && Array.from(el.querySelectorAll('h2, h3'));

	const handleScroll = (): void => {
		if (headings) active = [...headings].reverse().find(heading => heading.offsetTop <= window.scrollY + 48)!;
	}

	const handleClick = (index: number, id: string): void => {
		const {top} = headings[index].getBoundingClientRect();
		window.scrollTo({
			top: top + window.scrollY - 18,
			behavior: 'smooth'
		});

		history.pushState(null, '', `${window.location.pathname}#${id}`);
	}
</script>

<svelte:window on:scroll={handleScroll} />

<template>
	{#if el}
		{#each headings as {textContent, tagName, id}, i (id)}
			<li class={classNames(
				'mb-1 last:mb-0',
				+tagName[1] - 1 === 2 ? 'ml-6' : ''
			)}>
				<a
					href="#{id}"
					class={classNames(
						'block text-sm py-2 opacity-75',
						'dark:bg-opacity-50',
						'hover:opacity-100',
						active === headings[i] ? 'text-svelte-dark dark:text-svelte opacity-100' : ''
					)}
					class:active={active === headings[i]}
					on:click|preventDefault={() => handleClick(i, id)}
				>
					{textContent}
				</a>
			</li>
		{/each}
	{/if}
</template>