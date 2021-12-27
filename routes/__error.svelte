<script context="module" lang="ts">
	import type {ErrorLoad} from '@sveltejs/kit';

	export const load: ErrorLoad = ({status, error}) => {
		return {
			props: {
				status,
				stack: error?.stack
			}
		}
	}
</script>

<script lang="ts">
	import {classNames} from '$site/lib/helpers';
	import {dev} from '$app/env';

	export let status: number;
	export let stack: any;

	const messages: {[key: string]: {
		title: string,
		message: string
	}} = {
		'404': {title: 'Whoops!', message: `We can't seem to find that page.`},
		'500': {title: 'Not compute', message: `Something on our end as failed.`}
	}
</script>

<template>
	<div class="w-screen h-screen flex flex-col items-center justify-center">
		<div class="text-center">
			<h1 class="text-8xl text-center text-svelte-light font-black">{messages[status].title}</h1>
			<p class="mt-4 text-xl text-center">{messages[status].message}</p>
			<a href="/docs" class={classNames(
				'font-medium mt-12 text-sm px-4 py-2 rounded-lg transition border-2 inline-flex items-center gap-2',
				'bg-gray-800 border-gray-800 hover:border-gray-700',
				'focus:outline-2 focus:outline focus:outline-offset-2 focus:outline-svelte'
			)}>Back to Docs</a>
		</div>
		{#if dev && stack}
			<div class="mt-36 prose max-w-none">
				<pre>{stack}</pre>
			</div>
		{/if}
	</div>
</template>