<script>
	import {Listbox, ListboxButton, ListboxOptions, ListboxOption, ListboxLabel, Transition} from '$lib';

	const people = ['Wade Cooper', 'Arlene Mccoy', 'Devon Webb', 'Tom Cook', 'Tanya Fox', 'Hellen Schmidt'];
	let value;
</script>

<Listbox class="relative" {value} on:change={event => value = event.detail}>
	<ListboxLabel class="block">Send invite:</ListboxLabel>
	<ListboxButton class={({open}) => `w-64 inline-flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-white font-medium ${open ? 'bg-gray-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
		{value || 'Select a person'}
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
		</svg>
	</ListboxButton>
	<Transition
		leave="transition ease-in duration-100"
		leaveFrom="opacity-100"
		leaveTo="opacity-0"
	>
		<ListboxOptions class="absolute bg-gray-700 py-1 rounded-md z-10 w-64 translate-y-2">
			{#each people as person (person)}
				<ListboxOption
					key={person}
					value={person}
					let:active
					let:selected
					class={({active, selected}) => `flex items-center justify-between gap-2 cursor-pointer px-4 py-2 text-sm ${active ? 'bg-svelte/10 text-svelte-light' : ''} ${selected ? 'text-svelte-light' : ''}`}
				>
					<span class="truncate">
						{person}
					</span>
					{#if selected}
						<span class="w-4 h-4 text-svelte-light">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</span>
					{/if}
				</ListboxOption>
			{/each}
		</ListboxOptions>
	</Transition>
</Listbox>