<script>
	import Preview from '$site/components/Preview.svelte';

	import Example from './Example.svelte';
	import ExampleCode from './Example.svelte?raw';
</script>

# Menu (Dropdown)
Menus offer an easy way to build custom, accessible dropdown components with robust support for keyboard navigation.

<Preview code={ExampleCode}>
	<Example />
</Preview>



## Basic Example
Menus are built using `<Menu />`, `<MenuButton />`, `<MenuItems />`, and `<MenuItem />` components.

```svelte
<script>
	import {Menu, MenuButton, MenuItems, MenuItem} from '@rgossiaux/svelte-headlessui';
</script>

<Menu>
	<MenuButton>More</MenuButton>
	<MenuItems>
		<MenuItem href="/settings" class={({active}) => `flex ${active ? 'bg-sky-500' : ''}`}>
			Settings
		</MenuItem>
		<MenuItem as="button" class={({active}) => `flex ${active ? 'bg-sky-500' : ''}`}>
			Notifications
		</MenuItem>
		<MenuItem disabled>
			<span class="opacity-65">Invite a friend (coming soon!)</span>
		</MenuItem>
	</MenuItems>
</Menu>
```



## Styling the active item
There are two ways to style the active item:
- Exposing the slot prop allowing you to style any child elements.  
- Destructuring the class allowing you to style the current component.

We'll be using the `<MenuItem />` component as the example but this can be done for any of the components.

```svelte
<script>
	import {Menu, MenuButton, MenuItems, MenuItem} from '@rgossiaux/svelte-headlessui';
</script>

<Menu>
	<MenuButton>More</MenuButton>
	<MenuItems>

		<!-- Slot prop -->
		<MenuItem let:active>
			<span class="flex {active ? 'bg-sky-500' : ''}">Settings</span>
		</MenuItem>

		<!-- Destructured class -->
		<MenuItem class={({active}) => `flex ${active ? 'bg-sky-500' : ''}`}>
			Notifications
		</MenuItem>

	</MenuItems>
</Menu>
```

**Note**: destructuring the class can only be used on that component and cannot be passed down to any child elements.  
Slot Props can only be used on the child elements.



## Toggling the Menu
By default the `<MenuItems />` component will be shown/hidden automatically based on the internal `open` state tracked within the `<Menu />` component.  
  
If you'd rather handle this yourself, add the `static` prop to the `<MenuItems />` component to tell it to always render.

```svelte
<script>
	import {Menu, MenuButton, MenuItems, MenuItem} from '@rgossiaux/svelte-headlessui';
</script>

<Menu let:open>
	<MenuButton>More</MenuButton>
	<div class="absolute {open ? 'block' : 'hidden'}">
		<MenuItems static>
			<MenuItem>
				Notifications
			</MenuItem>
		</MenuItems>
	</div>
</Menu>
```



## Disabling an item
Add the `disabled` prop to disable a `<MenuItem />`. This will make it unselectable via keyboard navigation, and will be skipped when pressing up/down arrows.

```svelte
<script>
	import {Menu, MenuButton, MenuItems, MenuItem} from '@rgossiaux/svelte-headlessui';
</script>

<Menu>
	<MenuButton>More</MenuButton>
	<MenuItems>

		<MenuItem disabled>
			<span class="opacity-65">Invite a friend (coming soon!)</span>
		</MenuItem>

	</MenuItems>
</Menu>
```



## Transitions

To animate the `<MenuItems />` component, use the `Transition` component. All you need to do is wrap `<MenuItems />` in a `<Transition />`, and the transition will be applied automatically.

```svelte
<script>
	import {Menu, MenuButton, MenuItems, MenuItem, Transition} from '@rgossiaux/svelte-headlessui';
</script>

<Menu>
	<MenuButton>More</MenuButton>
	<Transition
		enter="transition duration-100 ease-out"
		enterFrom="transform scale-95 opacity-0"
		enterTo="transform scale-100 opacity-100"
		leave="transition duration-75 ease-out"
		leaveFrom="transform scale-100 opacity-100"
		leaveTo="transform scale-95 opacity-0"
	>
		<MenuItems>
			<MenuItem>Settings</MenuItem>
		</MenuItems>
	</Transition>
</Menu>
```

Additionally, you can pass a `show` prop the the `<Transition />` component. This works great when combied with the `static` prop for `<MenuItems />`.



## Different element for rendering
By default, the `<Menu />`  and its subcomponents each render a default element that is best suited.  
For example, `<MenuButton />` renders a `button`, and `<MenuItems />` renders a div.  
  
You can change any of these by using the `as` prop which exists on every component.

```svelte
<script>
	import {Menu, MenuButton, MenuItems, MenuItem} from '@rgossiaux/svelte-headlessui';
</script>

<Menu as="section">
	<MenuButton>More</MenuButton>
	<MenuItems as="ul">
		<MenuItem as="li" href="/settings" let:active>
			<a href="/settings" class="flex {active ? 'bg-sky-500' : ''}">Settings</a>
		</MenuItem>
	</MenuItems>
</Menu>
```



## Component API

### `<Menu />`
| Prop | Default | Description |
| :- | :- | :- |
| `as` | `div` | `String` <br> The element for the component to render as. |

| Slot Prop | Description |
| :-  | :- |
| `open` | `Boolean` <br> Whether or not the Menu is open. |


### `<MenuButton />`
| Prop | Default | Description |
| :- | :- | :- |
| `as` | `button` | `String` <br> The element for the component to render as. |

| Slot Prop | Description |
| :-  | :- |
| `open` | `Boolean` <br> Whether or not the Menu is open. |


### `<MenuItems />`
| Prop | Default | Description |
| :- | :- | :- |
| `as` | `div` | `String` <br> The element for the component to render as. |
| `static` | `false` | `Boolean` <br> Whether the element should ignore the internally managed open/closed state. |

| Slot Prop | Description |
| :-  | :- |
| `open` | `Boolean` <br> Whether or not the Menu is open. |


### `<MenuItem />`
| Prop | Default | Description |
| :- | :- | :- |
| `as` | `a` | `String` <br> The element for the component to render as. |
| `disabled` | `false` | `Boolean` <br> Whether or not the item should be disabled for keyboard navigation and ARIA purposes. |

| Slot Prop | Description |
| :-  | :- |
| `active` | `Boolean` <br> Whether or not the item is the active/focused item in the list. |
| `open` | `Boolean` <br> Whether or not the item is the disabled for keyboard navigation and ARIA purposes. |


- - -


## Other
"Accessibility notes" and "When to use" the `<Menu />` components can be found on the official [HeadlessUI website](https://headlessui.dev/react/menu)