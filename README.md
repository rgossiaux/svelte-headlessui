# svelte-headlessui

This is an unofficial, complete Svelte port of the Headless UI component library (https://headlessui.dev/). It contains **fully accessible, feature-rich, unstyled** UI components.

Documentation for this library is available at https://svelte-headlessui.goss.io

## Who is this for?

This library is for you if you fall into one of two categories:

- You want unstyled yet sophisticated customizable UI components that fully follow the WAI-ARIA specs. You want a component library to handle all the messy details (keyboard navigation, focus management, aria-\* attributes, and many many more), but you want to style your components yourself and not be constrained by existing design systems like Material UI.
  - Alternatively, you want to implement an existing design system in Svelte, and want a powerful set of primitives to build your components on, letting you focus on styling.
- You want to use the commercial Tailwind UI component library (https://tailwindui.com/) in your Svelte project, and want a drop-in replacement for the React/Vue components which power Tailwind UI.

This project is intended to keep an API as close as possible to the React API for the base Headless UI project, with only a few small differences. While one of the primary goals is to enable using Tailwind UI in a Svelte project with as little effort as possible, **neither Tailwind UI nor Tailwind CSS is required** to use these components.

This project is an **unofficial** port. I have no affiliation with Tailwind Labs and cannot offer commercial support for this project. With that said, I intend to keep it as up to date as possible with the upstream Headless UI project, including porting new components when they are released.

## Installation

```
npm install -D @rgossiaux/svelte-headlessui
```

## Usage

See https://svelte-headlessui.goss.io for full documentation.

## Credits

Credit for everything good about this library goes to Tailwind Labs for writing the original React/Vue versions. All bugs should be assumed to be my fault in the port (though as the codebases are so similar, bugs in upstream will likely affect this library too).

Additional thanks to https://github.com/hperrin/svelte-material-ui; this well-engineered Svelte library was the source of the action and event forwarding code, with minor modifications.

## License

This library is licensed under the MIT license; see the LICENSE file for more.
