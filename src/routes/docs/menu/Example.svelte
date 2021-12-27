<script>
	import {Menu, MenuButton, MenuItems, MenuItem, Transition} from '$lib';

	let clicked = '';
</script>

<div class="flex items-center gap-4">
	<Menu class="relative">
		<MenuButton class={({open}) => `inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white font-semibold ${open ? 'bg-gray-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
			Options
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</MenuButton>
		<Transition
			enter="transition duration-100 ease-out"
			enterFrom="transform scale-95 opacity-0"
			enterTo="transform scale-100 opacity-100"
			leave="transition duration-75 ease-out"
			leaveFrom="transform scale-100 opacity-100"
			leaveTo="transform scale-95 opacity-0"
		>
			<MenuItems static class="absolute rounded bg-gray-700 w-56 translate-y-2">
				<div class="p-2">
					<MenuItem as="button" class={({active}) => `flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-left ${active && 'bg-svelte-light text-white'}`} on:click={() => clicked = 'edit'}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
						</svg>
						Edit
					</MenuItem>
					<MenuItem as="button" class={({active}) => `flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-left ${active && 'bg-svelte-light text-white'}`} on:click={() => clicked = 'duplicate'}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						Duplicate
					</MenuItem>
				</div>
				<div class="h-[1px] bg-gray-600 mx-5"></div>
				<div class="p-2">
					<MenuItem disabled as="button" class={({active}) => `flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-left text-gray-500 pointer-events-none`} on:click={() => clicked = 'archive'}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
						</svg>
						Archive - Disabled
					</MenuItem>
				</div>
				<div class="h-[1px] bg-gray-600 mx-5"></div>
				<div class="p-2">
					<MenuItem as="button" class={({active}) => `flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-left ${active ? 'bg-red-500 text-white' : 'text-red-500'}`} on:click={() => clicked = 'delete'}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						Delete
					</MenuItem>
				</div>
			</MenuItems>
		</Transition>
	</Menu>
	<p class="w-36">
		Clicked: {clicked}
	</p>
</div>