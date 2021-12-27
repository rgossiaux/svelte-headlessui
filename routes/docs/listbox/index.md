<script>
	import Preview from '$site/components/Preview.svelte';

	import Example from './Example.svelte';
	import ExampleCode from './Example.svelte?raw';
</script>

# Listbox (Select)
Listboxes are a great foundation for building custom, accessible select menus for your app, complete with robust support for keyboard navigation.

<Preview code={ExampleCode}>
	<Example />
</Preview>



## Basic Example
Listboxes are built using `<Listbox />`, `<ListboxButton />`, `<ListboxOptions />`, and `<ListboxOption />` components.

```svelte
<script>
	import {Listbox, ListboxButton, ListboxOptions, ListboxOption} from '@rgossiaux/svelte-headlessui';

	const people = [
		{id: 1, name: 'Wade Cooper', unavailable: true},
		{id: 2, name: 'Arlene Mccoy', unavailable: true},
		{id: 3, name: 'Devon Webb', unavailable: false},
		{id: 4, name: 'Tom Cook', unavailable: true}
	];
	let selectedPerson = people[0];
</script>

<Listbox value={selectedPerson} on:change={e => selectedPerson = e.detail}>
	<ListboxButton>{selectedPerson || 'Select a person'}</ListboxButton>
	<ListboxOptions>
		{#each people as person (person.id)}
			<ListboxOption key={person.id} value={person} disabled={person.unavailable}>
				{person.name}
			</ListboxOption>
		{/each}
	</ListboxOptions>
</Listbox>
```



## Styling the active & selected option
There are two ways to style the active and selected option:
- Exposing the slot prop allowing you to style any child elements.  
- Destructuring the class allowing you to style the current component.

In this example we'll be using both.

```svelte
<script>
	import {Listbox, ListboxButton, ListboxOptions, ListboxOption} from '@rgossiaux/svelte-headlessui';

	const people = [
		{id: 1, name: 'Wade Cooper'},
		{id: 2, name: 'Arlene Mccoy'},
		{id: 3, name: 'Devon Webb'},
		{id: 4, name: 'Tom Cook'}
	];
</script>

<Listbox>
	<ListboxButton>Select a person</ListboxButton>
	<ListboxOptions>

		<!--
			Make sure to key the each loop.
			It will Svelte to auto re-render when there's any changes.
		-->
		{#each people as person (person.id)}
			<ListboxOption
				key={person.id}
				value={person}
				let:selected
				let:active
				class={({active, selected}) => `
					flex items-center justify-between
					${active ? 'bg-teal-500/10 text-teal-500' : ''}
					${selected ? 'text-teal-500' : ''}
				`}
			>
				{person.name}
				{#if selected}
					<svg class="text-teal-500"><!-- checkbox svg --></svg>
				{/if}
			</ListboxOption>
		{/each}

	</ListboxOptions>
</Listbox>
```

**Note**: destructuring the class can only be used on that component and cannot be passed down to any child elements.  
Slot Props can only be used on the child elements.



## Toggling the Listbox
By default the `<ListboxOptions />` component will be shown/hidden automatically based on the internal `open` state tracked within the `<Listbox />` component.  
  
If you'd rather handle this yourself, add the `static` prop to the `<ListboxOptions />` component to tell it to always render.

```svelte
<script>
	import {Listbox, ListboxButton, ListboxOptions, ListboxOption} from '@rgossiaux/svelte-headlessui';

	const people = [
		{id: 1, name: 'Wade Cooper'},
		{id: 2, name: 'Arlene Mccoy'},
		{id: 3, name: 'Devon Webb'},
		{id: 4, name: 'Tom Cook'}
	];
</script>

<Listbox let:open>
	<ListboxButton>More</ListboxButton>
	<div class="absolute {open ? 'block' : 'hidden'}">
		<ListboxOptions static>
			{#each people as person (person.id)}
				<ListboxOption key={person.id} value={person}>
					{person.name}
				</ListboxOption>
			{/each}
		</ListboxOptions>
	</div>
</Listbox>
```



## Disabling an item
Add the `disabled` prop to disable a `<ListboxOption />`. This will make it unselectable via keyboard navigation, and will be skipped when pressing up/down arrows.

```svelte
<script>
	import {Listbox, ListboxButton, ListboxOptions, ListboxOption} from '@rgossiaux/svelte-headlessui';

	const people = [
		{id: 1, name: 'Wade Cooper', unavailable: false},
		{id: 2, name: 'Arlene Mccoy', unavailable: false},
		{id: 3, name: 'Devon Webb', unavailable: true},
		{id: 4, name: 'Tom Cook', unavailable: false}
	];
</script>

<Listbox>
	<ListboxButton>More</ListboxButton>
	<ListboxOptions>

		{#each people as person (person.id)}
			<ListboxOption
				key={person.id}
				value={person}
				disabled={person.unavailable}
			>
				<span class="opacity-65">Invite a friend (coming soon!)</span>
			</ListboxOption>
		{/each}

	</ListboxOptions>
</Listbox>
```



## Transitions

To animate the `<ListboxOptions />` component, use the `Transition` component. All you need to do is wrap `<ListboxOptions />` in a `<Transition />`, and the transition will be applied automatically.

```svelte
<script>
	import {Listbox, ListboxButton, ListboxOptions, ListboxOption, Transition} from '@rgossiaux/svelte-headlessui';
</script>

<Listbox>
	<ListboxButton>Select a person</ListboxButton>
	<Transition
		enter="transition duration-100 ease-out"
		enterFrom="transform scale-95 opacity-0"
		enterTo="transform scale-100 opacity-100"
		leave="transition duration-75 ease-out"
		leaveFrom="transform scale-100 opacity-100"
		leaveTo="transform scale-95 opacity-0"
	>
		<ListboxOptions>
			<ListboxOption>Wade Cooper</ListboxOption>
		</ListboxOptions>
	</Transition>
</Listbox>
```

Additionally, you can pass a `show` prop the the `<Transition />` component. This works great when combied with the `static` prop for `<ListboxOptions />`.



## Different element for rendering
By default, the `<Listbox />`  and its subcomponents each render a default element that is best suited.  
For example, `<ListboxButton />` renders a `button`, and `<ListboxOptions />` renders a div.  
  
You can change any of these by using the `as` prop which exists on every component.

```svelte
<script>
	import {Listbox, ListboxButton, ListboxOptions, ListboxOption} from '@rgossiaux/svelte-headlessui';

	const people = [
		{id: 1, name: 'Wade Cooper'},
		{id: 2, name: 'Arlene Mccoy'},
		{id: 3, name: 'Devon Webb'},
		{id: 4, name: 'Tom Cook'}
	];
</script>

<Listbox as="div">
	<ListboxButton>More</ListboxButton>
	<ListboxOptions as="div">
		{#each people as person (person.id)}
			<ListboxOption value={person} key={person.id} as="span">
				{person.name}
			</ListboxOption>
		{/each}
	</ListboxOptions>
</Listbox>
```



## Component API

### `<Listbox />`
| Prop | Default | Description |
| :- | :- | :- |
| `as` | `div` | `String` <br> The element for `<Listbox />` to render as. |
| `value` | — | `any` <br> The selected value. |
| `disabled` | `false` | `Boolean` <br> Disable the entire `<Listbox />` component and it's children. |
| `horizontal` | `false` | `Boolean` <br> When true, the orientation of the `<ListboxOptions />` will be `horizontal`, otherwise it will be `vertical`.

| Event | Description |
| :- | :- |
| `change` | `detail` <br> The function to call when a new option is selected.

| Slot Prop | Description |
| :-  | :- |
| `open` | `Boolean` <br> Whether or not `<Listbox />` is open. |
| `disabled` | `Boolean` <br> Whether or not `<Listbox />` is disabled. |


### `<ListboxButton />`
| Prop | Default | Description |
| :- | :- | :- |
| `as` | `button` | `String` <br> The element for `<ListboxButton />` to render as. |

| Slot Prop | Description |
| :-  | :- |
| `open` | `Boolean` <br> Whether or not `<Listbox />` is open. |
| `disabled` | `Boolean` <br> Whether or not `<ListboxButton />` is disabled. |


### `<ListboxLabel />`
A Label that can be used for more control over the text your Listbox will announce to screenreaders. Its `id` attribute will be automatically generated and linked to the root `<Listbox />` component via the `aria-labelledby` attribute.

| Prop | Default | Description |
| :- | :- | :- |
| `as` | `label` | `String` <br> The element for `<ListboxLabel />` to render as. |

| Slot Prop | Description |
| :-  | :- |
| `open` | `Boolean` <br> Whether or not `<Listbox />` is open. |
| `disabled` | `Boolean` <br> Whether or not `<ListboxLabel />` is disabled. |


### `<ListboxOptions />`
| Prop | Default | Description |
| :- | :- | :- |
| `as` | `div` | `String` <br> The element for `<ListboxOptions />` to render as. |
| `static` | `false` | `Boolean` <br> Whether the element should ignore the internally managed open/closed state. |

| Slot Prop | Description |
| :-  | :- |
| `open` | `Boolean` <br> Whether or not `<Listbox />` is open. |


### `<ListboxOption />`
| Prop | Default | Description |
| :- | :- | :- |
| `as` | `div` | `String` <br> The element for `<ListboxOption />` to render as. |
| `value` | — | `any` <br> The option value.
| `disabled` | `false` | `Boolean` <br> Whether or not the option should be disabled for keyboard navigation and ARIA purposes. |

| Slot Prop | Description |
| :-  | :- |
| `active` | `Boolean` <br> Whether or not the option is the active/focused option. |
| `selected` | `Boolean` <br> Whether or not the option is the selected option. |
| `disabled` | `Boolean` <br> Whether or not the option is the disabled for keyboard navigation and ARIA purposes. |


- - -


## Other
"Accessibility notes" and "When to use" the `<Listbox />` components can be found on the official [HeadlessUI website](https://headlessui.dev/react/Listbox)