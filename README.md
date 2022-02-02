# svelte-headlessui

This is an unofficial, complete Svelte port of the Headless UI component library (https://headlessui.dev/). It contains **fully accessible, feature-rich, unstyled** UI components.

## Who is this for?

This library is for you if you fall into one of two categories:

- You want unstyled yet sophisticated customizable UI components that fully follow the WAI-ARIA specs. You want a component library to handle all the messy details (keyboard navigation, focus management, aria-\* attributes, and many many more), but you want to style your components yourself and not be constrained by existing design systems like Material UI.
- You want to use the commercial Tailwind UI component library (https://tailwindui.com/) in your Svelte project, and want a drop-in replacement for the React components which power Tailwind UI.

This project is intended to keep an API as close as possible to the React API for the base Headless UI project, with only a few small differences. While one of the primary goals is to enable using Tailwind UI in a Svelte project with as little effort as possible, **neither Tailwind UI nor Tailwind CSS is required** to use these components.

This project is an **unofficial** port. I have no affiliation with Tailwind Labs and cannot offer commercial support for this project. With that said, I intend to keep it as up to date as possible with the upstream Headless UI project, including porting new components when they are released.

## Installation

```
npm install -D @rgossiaux/svelte-headlessui
```

## Usage

For now, until I write separate documentation, you can refer to the [Headless UI React documentation](https://headlessui.dev/). The API is nearly identical to the React API there, with the following differences:

- Components do not have . in their names; use `ListboxButton` instead of `Listbox.Button`
- Event handlers are done Svelte-style with custom events:

```
// React version
<Listbox onChange={(value) => console.log(value)}>
  /* Stuff */
</Listbox>

<!--- Svelte version --->
<Listbox on:change={(e) => console.log(e.detail)}>
  <!--- Stuff --->
</Listbox>
```

Note the `.detail` that is needed to get the event value in the Svelte version.

- Instead of render props, we use Svelte's [slot props](https://svelte.dev/tutorial/slot-props):

```
// React version
<Listbox.Button>
  {({open, disabled} => /* Something using open and disabled */)}
</Listbox.Button>

<!--- Svelte version --->
<ListboxButton let:open let:disabled>
  <!--- Something using open and disabled --->
</ListboxButton>
```

- When porting React code, HTML attributes use their real names instead of the camelCased React versions. In particular, use `class=` instead of `className=`.
- When porting React code, use `{#each}` instead of `.map` (don't forget to add a key!):

```
// React version
{people.map((person) => (
  <Listbox.Option
    key={person.id}
    ...

<!--- Svelte version --->
{#each people as person (person.id)}
  <ListboxOption
    ...
```

Similarly, React's `{value && (<Component />)}` style syntax becomes `{#if value} <Component /> {/if}` in Svelte, of course.

- While the `as` prop is supported, `as={Fragment}` support is not possible due to limitations in Svelte itself. You'll have to settle for rendering a `div` or similar. Usually this won't cause any problems, especially if you are writing your own code, but if you are porting React Headless UI code that both uses `as={Fragment}` and `z-index`, your div could possibly create a new [stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context), causing the `z-index` to not work correctly. If this happens, you can fix by copying the `z-index` (and a relevant `position`) to the component that used to render as a `Fragment`.

Furthermore, specific to Svelte, you may

- Pass [actions](https://svelte.dev/tutorial/actions) to any component in this library using the `use` prop, with the syntax `use={[[action1, action1options], [action2], [action3, action3options], ...]}`, and they will be forwarded to the underlying DOM element.
- Add your own event listeners with modifiers, which will be forwarded to the underyling DOM element. Modifiers are separated with the `!` character instead of the normal `|`: `on:click!capture={(e) => ...}`

## Credits

Credit for everything good about this library goes to Tailwind Labs for writing the original React/Vue versions. All bugs should be assumed to be my fault in the port (though as the codebases are so similar, bugs in upstream will likely affect this library too).

Additional thanks to https://github.com/hperrin/svelte-material-ui; this well-engineered Svelte library was the source of the action and event forwarding code, with minor modifications.

## License

This library is licensed under the MIT license; see the LICENSE file for more.
