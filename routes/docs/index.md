# What is HeadlessUI?

HeadessUI gives you fully accessable components that follow the WAI-ARIA specs out of the box while being completely unstyled.  
Allowing you; the end user to determine how it looks. No conficting styles or CSS selectors.  
  
Works beautifully with TailwindCSS.

## Installation
Run one of these commands with your package manager of choice:

```bash
npm install sveadlessui -D
# or
yarn add sveadlessui -D
# or
pnpm add sveadlessui -D
```
  
  
## Simple usage

Open any `.svelte` file and import the components you wish to use.  
Example using the [Menu](/docs/menu) component:

```svelte
<script>
	import {Menu, MenuButton, MenuItems, MenuItem} from '@rgossiaux/svelte-headlessui';
</script>

<Menu>
	<MenuButton>Options</MenuButton>
	<MenuItems>
		<MenuItem class={({active}) => `rounded-md {active ? 'bg-teal-500' : ''}`}>Edit</MenuItem>
		<MenuItem class={({active}) => `rounded-md {active ? 'bg-teal-500' : ''}`}>Delete</MenuItem>
	</MenuItems>
</Menu>
```