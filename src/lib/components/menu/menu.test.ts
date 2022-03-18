import { assertActiveElement, assertMenu, assertMenuButton, assertMenuButtonLinkedWithMenu, assertMenuItem, assertMenuLinkedWithMenuItem, assertNoActiveMenuItem, getByText, getMenu, getMenuButton, getMenuButtons, getMenuItems, getMenus, MenuState } from "$lib/test-utils/accessibility-assertions";
import { act, render } from "@testing-library/svelte";
import { Menu, MenuButton, MenuItem, MenuItems } from ".";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import TestRenderer from "$lib/test-utils/TestRenderer.svelte";
import { click, focus, Keys, MouseButton, mouseLeave, mouseMove, press, shift, type, word } from "$lib/test-utils/interactions";
import { Transition, TransitionChild } from "../transitions";
import TransitionDebug from "$lib/components/disclosure/_TransitionDebug.svelte";
import svelte from "svelte-inline-compile";
import { writable } from "svelte/store";

let mockId = 0;
jest.mock('../../hooks/use-id', () => {
  return {
    useId: jest.fn(() => ++mockId),
  }
})

beforeEach(() => mockId = 0)
beforeAll(() => {
  // jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  // jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})
afterAll(() => jest.restoreAllMocks())

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

describe('Safe guards', () => {
  it.each([
    ['MenuButton', MenuButton],
    ['MenuItems', MenuItems],
    ['MenuItem', MenuItem],
  ])(
    'should error when we are using a <%s /> without a parent <Menu />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Menu /> component.`
      )
    })
  )

  it(
    'should be possible to render a Menu without crashing',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Menu', () => {
    it(
      'Menu should have slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
        <Menu let:open>
          <MenuButton>Trigger</MenuButton>
          {#if open}
            <MenuItems>
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          {/if}
        </Menu>
      `)

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        await click(getMenuButton())

        assertMenuButton({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.Visible })
      })
    )
  })

  describe('MenuButton', () => {
    it(
      'MenuButton should have slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Menu>
            <MenuButton let:open>{open}</MenuButton>
            <MenuItems>
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
        `)

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: "false",
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        await click(getMenuButton())

        assertMenuButton({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: "true",
        })
        assertMenu({ state: MenuState.Visible })
      })
    )

    it(
      'MenuButton should have slot props and support an `as` prop',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Menu>
            <MenuButton as="div" role="button" let:open>
              {open}
            </MenuButton>
            <MenuItems>
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
        `)

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: "false",
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        await click(getMenuButton())

        assertMenuButton({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: "true",
        })
        assertMenu({ state: MenuState.Visible })
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
            ]],
          ]
        })

        expect(getMenuButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, { type: "submit" }, "Trigger"],
            ]],
          ]
        })

        expect(getMenuButton()).toHaveAttribute('type', 'submit')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, { as: "div" }, "Trigger"],
            ]],
          ]
        })

        expect(getMenuButton()).not.toHaveAttribute('type')
      })

    })
  })

  describe('MenuItems', () => {
    it(
      'MenuItems should have slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems let:open>
              <MenuItem as="a">{open}</MenuItem>
            </MenuItems>
          </Menu>
        `)

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        await click(getMenuButton())

        assertMenuButton({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({
          state: MenuState.Visible,
          textContent: "true",
        })
      })
    )

    it('should be possible to always render the MenuItems if we provide it a `static` prop', () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, { static: true }, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Let's verify that the Menu is already there
      expect(getMenu()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the MenuItems', async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, { unmount: false }, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      assertMenu({ state: MenuState.InvisibleHidden })

      // Let's open the Menu, to see if it is not hidden anymore
      await click(getMenuButton())

      assertMenu({ state: MenuState.Visible })
    })
  })

  describe('MenuItem', () => {
    it(
      'MenuItem should have slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" let:active let:disabled>{JSON.stringify({ active, disabled })}</MenuItem>
          </MenuItems>
        </Menu>
      `)

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        await click(getMenuButton())

        assertMenuButton({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({
          state: MenuState.Visible,
          textContent: JSON.stringify({ active: false, disabled: false }),
        })
      })
    )

    it('should guarantee the menu item order after a few unmounts', async () => {
      let showFirst = writable(false);
      render(svelte`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          {#if $showFirst}
            <MenuItem as="a">Item A</MenuItem>
          {/if}
          <MenuItem as="a">Item B</MenuItem>
          <MenuItem as="a">Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open Listbox
      await click(getMenuButton())

      let items = getMenuItems()
      expect(items).toHaveLength(2)
      items.forEach(item => assertMenuItem(item))

      // Make the first item active
      await press(Keys.ArrowDown)

      // Verify that the first menu item is active
      assertMenuLinkedWithMenuItem(items[0])

      // Now add a new option dynamically
      await act(() => showFirst.set(true));

      // New option should be treated correctly
      items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))

      // Active item should now be second
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go to the first option
      await press(Keys.Home)
      assertMenuLinkedWithMenuItem(items[0])

      // And the last one
      await press(Keys.End)
      assertMenuLinkedWithMenuItem(items[2])

    })
  })
})

describe('Rendering composition', () => {
  it(
    'should be possible to conditionally render classes (aka class can be a function?!)',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, { class: (bag: any) => JSON.stringify(bag), id: "menu" }, [
            [MenuButton, { class: (bag: any) => JSON.stringify(bag) }, "Trigger"],
            [MenuItems, { class: (bag: any) => JSON.stringify(bag) }, [
              [MenuItem, { as: "a", class: (bag: any) => JSON.stringify(bag) }, "Item A"],
              [MenuItem, { as: "a", disabled: true, class: (bag: any) => JSON.stringify(bag) }, "Item B"],
              [MenuItem, { as: "a", class: "no-special-treatment" }, "Item C"],
            ]]
          ]],
        ]
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify correct classNames
      expect("" + document.querySelector('[id="menu"]')?.classList).toEqual(JSON.stringify({ open: false }))
      expect("" + getMenuButton()?.classList).toEqual(JSON.stringify({ open: false }))

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      // Verify correct classNames
      expect("" + document.querySelector('[id="menu"]')?.classList).toEqual(JSON.stringify({ open: true }))
      expect("" + getMenu()?.classList).toEqual(JSON.stringify({ open: true }))
      expect("" + getMenuButton()?.classList).toEqual(JSON.stringify({ open: true }))
      expect('' + items[0].classList).toEqual(JSON.stringify({ active: false, disabled: false }))
      expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
      expect('' + items[2].classList).toEqual('no-special-treatment')

      // Double check that nothing is active
      assertNoActiveMenuItem()

      // Make the first item active
      await press(Keys.ArrowDown)

      // Verify the classNames
      expect('' + items[0].classList).toEqual(JSON.stringify({ active: true, disabled: false }))
      expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
      expect('' + items[2].classList).toEqual('no-special-treatment')

      // Double check that the first item is the active one
      assertMenuLinkedWithMenuItem(items[0])

      // Let's go down, this should go to the third item since the second item is disabled!
      await press(Keys.ArrowDown)

      // Verify the classNames
      expect('' + items[0].classList).toEqual(JSON.stringify({ active: false, disabled: false }))
      expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
      expect('' + items[2].classList).toEqual('no-special-treatment')

      // Double check that the last item is the active one
      assertMenuLinkedWithMenuItem(items[2])
    })
  )

  it(
    'should be possible to swap the menu item with a button for example',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "button" }, "Item A"],
              [MenuItem, { as: "button" }, "Item B"],
              [MenuItem, { as: "button" }, "Item C"],
            ]]
          ]],
        ]
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open menu
      await click(getMenuButton())

      // Verify items are buttons now
      let items = getMenuItems()
      items.forEach(item => assertMenuItem(item, { tag: 'button' }))
    })
  )

  it(
    'should mark all the elements between MenuItems and MenuItem with role none',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <div class="outer">
            <MenuItems>
              <div class="py-1 inner">
                <MenuItem as="button">Item A</MenuItem>
                <MenuItem as="button">Item B</MenuItem>
              </div>
              <div class="py-1 inner">
                <MenuItem as="button">Item C</MenuItem>
                <MenuItem>
                  <div>
                    <div class="outer">Item D</div>
                  </div>
                </MenuItem>
              </div>
              <div class="py-1 inner">
                <form class="inner">
                  <MenuItem as="button">Item E</MenuItem>
                </form>
              </div>
            </MenuItems>
          </div>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      expect.hasAssertions()

      document.querySelectorAll('.outer').forEach(element => {
        expect(element).not.toHaveAttribute('role', 'none')
      })

      document.querySelectorAll('.inner').forEach(element => {
        expect(element).toHaveAttribute('role', 'none')
      })
    })
  )
})

describe('Composition', () => {
  it(
    'should be possible to wrap the MenuItems with a Transition component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [TransitionDebug, { name: "Menu", fn: orderFn }],
            [Transition, {}, [
              [TransitionDebug, { name: "Transition", fn: orderFn }],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, [
                  "Item A",
                  [TransitionDebug, { name: "MenuItem", fn: orderFn }],
                ]]
              ]]
            ]]
          ]],
        ]
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({
        state: MenuState.Visible,
        textContent: "Item A",
      })

      await click(getMenuButton())

      // Wait for all transitions to finish
      await nextFrame()

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Menu'],
        ['Mounting - Transition'],
        ['Mounting - MenuItem'],
        ['Unmounting - Transition'],
        ['Unmounting - MenuItem'],
      ])
    })
  )

  it(
    'should be possible to wrap the MenuItems with a TransitionChild component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [TransitionDebug, { name: "Menu", fn: orderFn }],
            [TransitionChild, {}, [
              [TransitionDebug, { name: "Transition", fn: orderFn }],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, [
                  "Item A",
                  [TransitionDebug, { name: "MenuItem", fn: orderFn }],
                ]]
              ]]
            ]]
          ]],
        ]
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({
        state: MenuState.Visible,
        textContent: "Item A",
      })

      await click(getMenuButton())

      // Wait for all transitions to finish
      await nextFrame()

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Menu'],
        ['Mounting - Transition'],
        ['Mounting - MenuItem'],
        ['Unmounting - Transition'],
        ['Unmounting - MenuItem'],
      ])
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the menu with Enter',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-items-2' },
        })
        assertMenuButtonLinkedWithMenu()

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))

        // Verify that the first menu item is active
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should not be possible to open the menu with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, { disabled: true }, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Try to open the menu
        await press(Keys.Enter)

        // Verify it is still closed
        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })
      })
    )

    it(
      'should have no active menu item when there are no menu items at all',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems]
            ]],
          ]
        })

        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)
        assertMenu({ state: MenuState.Visible })

        assertNoActiveMenuItem()
      })
    )

    it(
      'should focus the first non disabled menu item when opening with Enter',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

        // Verify that the first non-disabled menu item is active
        assertMenuLinkedWithMenuItem(items[1])
      })
    )

    it(
      'should focus the first non disabled menu item when opening with Enter (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

        // Verify that the first non-disabled menu item is active
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should have no active menu item upon Enter key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        assertNoActiveMenuItem()
      })
    )

    it(
      'should be possible to close the menu with Enter when there is no active menuitem',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Open menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })

        // Close menu
        await press(Keys.Enter)

        // Verify it is closed
        assertMenuButton({ state: MenuState.InvisibleUnmounted })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )

    it(
      'should be possible to close the menu with Enter and invoke the active menu item',
      suppressConsoleLogs(async () => {
        let clickHandler = jest.fn()
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", onClick: clickHandler }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Open menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })

        // Activate the first menu item
        let items = getMenuItems()
        await mouseMove(items[0])

        // Close menu, and invoke the item
        await press(Keys.Enter)

        // Verify it is closed
        assertMenuButton({ state: MenuState.InvisibleUnmounted })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getMenuButton())

        // Verify the "click" went through on the `a` tag
        expect(clickHandler).toHaveBeenCalled()
      })
    )

    // This test is modified from the React one since we don't support rendering a MenuItem as a Fragment
    it(
      'should be possible to use a button as a menu item and invoke it upon Enter',
      suppressConsoleLogs(async () => {
        let clickHandler = jest.fn()
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "button", onClick: clickHandler }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Open menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })

        // Activate the second menu item
        let items = getMenuItems()
        await mouseMove(items[1])

        // Close menu, and invoke the item
        await press(Keys.Enter)

        // Verify it is closed
        assertMenuButton({ state: MenuState.InvisibleUnmounted })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Verify the button got "clicked"
        expect(clickHandler).toHaveBeenCalledTimes(1)

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the menu with Space',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Space)

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-items-2' },
        })
        assertMenuButtonLinkedWithMenu()

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should not be possible to open the menu with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, { disabled: true }, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })
        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Try to open the menu
        await press(Keys.Space)

        // Verify it is still closed
        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })
      })
    )

    it(
      'should have no active menu item when there are no menu items at all',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems]
            ]],
          ]
        })

        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Space)
        assertMenu({ state: MenuState.Visible })

        assertNoActiveMenuItem()
      })
    )

    it(
      'should focus the first non disabled menu item when opening with Space',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Space)

        let items = getMenuItems()

        // Verify that the first non-disabled menu item is active
        assertMenuLinkedWithMenuItem(items[1])
      })
    )

    it(
      'should focus the first non disabled menu item when opening with Space (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Space)

        let items = getMenuItems()

        // Verify that the first non-disabled menu item is active
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should have no active menu item upon Space key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Space)

        assertNoActiveMenuItem()
      })
    )

    it(
      'should be possible to close the menu with Space when there is no active menuitem',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Open menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })

        // Close menu
        await press(Keys.Space)

        // Verify it is closed
        assertMenuButton({ state: MenuState.InvisibleUnmounted })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )

    it(
      'should be possible to close the menu with Space and invoke the active menu item',
      suppressConsoleLogs(async () => {
        let clickHandler = jest.fn()
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", onClick: clickHandler }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Open menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })

        // Activate the first menu item
        let items = getMenuItems()
        await mouseMove(items[0])

        // Close menu, and invoke the item
        await press(Keys.Space)

        // Verify it is closed
        assertMenuButton({ state: MenuState.InvisibleUnmounted })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Verify the "click" went through on the `a` tag
        expect(clickHandler).toHaveBeenCalled()

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )
  })

  describe('`Escape` key', () => {
    it(
      'should be possible to close an open menu with Escape',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Space)

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-items-2' },
        })
        assertMenuButtonLinkedWithMenu()

        // Close menu
        await press(Keys.Escape)

        // Verify it is closed
        assertMenuButton({ state: MenuState.InvisibleUnmounted })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )
  })

  describe('`Tab` key', () => {
    it(
      'should focus trap when we use Tab',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-items-2' },
        })
        assertMenuButtonLinkedWithMenu()

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[0])

        // Try to tab
        await press(Keys.Tab)

        // Verify it is still open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({ state: MenuState.Visible })
      })
    )

    it(
      'should focus trap when we use Shift+Tab',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-items-2' },
        })
        assertMenuButtonLinkedWithMenu()

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[0])

        // Try to Shift+Tab
        await press(shift(Keys.Tab))

        // Verify it is still open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({ state: MenuState.Visible })
      })
    )
  })

  describe('`ArrowDown` key', () => {
    it(
      'should be possible to open the menu with ArrowDown',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowDown)

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-items-2' },
        })
        assertMenuButtonLinkedWithMenu()

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))

        // Verify that the first menu item is active
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should not be possible to open the menu with ArrowDown when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, { disabled: true }, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Try to open the menu
        await press(Keys.ArrowDown)

        // Verify it is still closed
        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })
      })
    )

    it(
      'should have no active menu item when there are no menu items at all',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems]
            ]],
          ]
        })

        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowDown)
        assertMenu({ state: MenuState.Visible })

        assertNoActiveMenuItem()
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the menu items',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[0])

        // We should be able to go down once
        await press(Keys.ArrowDown)
        assertMenuLinkedWithMenuItem(items[1])

        // We should be able to go down again
        await press(Keys.ArrowDown)
        assertMenuLinkedWithMenuItem(items[2])

        // We should NOT be able to go down again (because last item). Current implementation won't go around.
        await press(Keys.ArrowDown)
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the menu items and skip the first disabled one',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[1])

        // We should be able to go down once
        await press(Keys.ArrowDown)
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the menu items and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[2])
      })
    )
  })

  describe('`ArrowUp` key', () => {
    it(
      'should be possible to open the menu with ArrowUp and the last item should be active',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-items-2' },
        })
        assertMenuButtonLinkedWithMenu()

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))

        // ! ALERT: The LAST item should now be active
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should not be possible to open the menu with ArrowUp and the last item should be active when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, { disabled: true }, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Try to open the menu
        await press(Keys.ArrowUp)

        // Verify it is still closed
        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })
      })
    )

    it(
      'should have no active menu item when there are no menu items at all',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems]
            ]],
          ]
        })

        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)
        assertMenu({ state: MenuState.Visible })

        assertNoActiveMenuItem()
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the menu items and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should not be possible to navigate up or down if there is only a single non-disabled item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[2])

        // We should not be able to go up (because those are disabled)
        await press(Keys.ArrowUp)
        assertMenuLinkedWithMenuItem(items[2])

        // We should not be able to go down (because this is the last item)
        await press(Keys.ArrowDown)
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the menu items',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-items-2' },
        })
        assertMenuButtonLinkedWithMenu()

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[2])

        // We should be able to go down once
        await press(Keys.ArrowUp)
        assertMenuLinkedWithMenuItem(items[1])

        // We should be able to go down again
        await press(Keys.ArrowUp)
        assertMenuLinkedWithMenuItem(items[0])

        // We should NOT be able to go up again (because first item). Current implementation won't go around.
        await press(Keys.ArrowUp)
        assertMenuLinkedWithMenuItem(items[0])
      })
    )
  })

  describe('`End` key', () => {
    it(
      'should be possible to use the End key to go to the last menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

        // We should be on the first item
        assertMenuLinkedWithMenuItem(items[0])

        // We should be able to go to the last item
        await press(Keys.End)
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should be possible to use the End key to go to the last non disabled menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
                [MenuItem, { as: "a", disabled: true }, "Item D"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

        // We should be on the first item
        assertMenuLinkedWithMenuItem(items[0])

        // We should be able to go to the last non-disabled item
        await press(Keys.End)
        assertMenuLinkedWithMenuItem(items[1])
      })
    )

    it(
      'should be possible to use the End key to go to the first menu item if that is the only non-disabled menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
                [MenuItem, { as: "a", disabled: true }, "Item D"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.End)

        let items = getMenuItems()
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should have no active menu item upon End key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
                [MenuItem, { as: "a", disabled: true }, "Item D"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.End)

        assertNoActiveMenuItem()
      })
    )
  })

  describe('`PageDown` key', () => {
    it(
      'should be possible to use the PageDown key to go to the last menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

        // We should be on the first item
        assertMenuLinkedWithMenuItem(items[0])

        // We should be able to go to the last item
        await press(Keys.PageDown)
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should be possible to use the PageDown key to go to the last non disabled menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
                [MenuItem, { as: "a", disabled: true }, "Item D"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

        // We should be on the first item
        assertMenuLinkedWithMenuItem(items[0])

        // We should be able to go to the last non-disabled item
        await press(Keys.PageDown)
        assertMenuLinkedWithMenuItem(items[1])
      })
    )

    it(
      'should be possible to use the PageDown key to go to the first menu item if that is the only non-disabled menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
                [MenuItem, { as: "a", disabled: true }, "Item D"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.PageDown)

        let items = getMenuItems()
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should have no active menu item upon PageDown key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
                [MenuItem, { as: "a", disabled: true }, "Item D"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.PageDown)

        assertNoActiveMenuItem()
      })
    )
  })

  describe('`Home` key', () => {
    it(
      'should be possible to use the Home key to go to the first menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        let items = getMenuItems()

        // We should be on the last item
        assertMenuLinkedWithMenuItem(items[2])

        // We should be able to go to the first item
        await press(Keys.Home)
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should be possible to use the Home key to go to the first non disabled menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
                [MenuItem, { as: "a" }, "Item D"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.Home)

        let items = getMenuItems()

        // We should be on the first non-disabled item
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should be possible to use the Home key to go to the last menu item if that is the only non-disabled menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
                [MenuItem, { as: "a" }, "Item D"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.Home)

        let items = getMenuItems()
        assertMenuLinkedWithMenuItem(items[3])
      })
    )

    it(
      'should have no active menu item upon Home key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
                [MenuItem, { as: "a", disabled: true }, "Item D"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.Home)

        assertNoActiveMenuItem()
      })
    )
  })

  describe('`PageUp` key', () => {
    it(
      'should be possible to use the PageUp key to go to the first menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "Item A"],
                [MenuItem, { as: "a" }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        let items = getMenuItems()

        // We should be on the last item
        assertMenuLinkedWithMenuItem(items[2])

        // We should be able to go to the first item
        await press(Keys.PageUp)
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should be possible to use the PageUp key to go to the first non disabled menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a" }, "Item C"],
                [MenuItem, { as: "a" }, "Item D"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        let items = getMenuItems()

        // We should be on the first non-disabled item
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should be possible to use the PageUp key to go to the last menu item if that is the only non-disabled menu item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
                [MenuItem, { as: "a" }, "Item D"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        let items = getMenuItems()
        assertMenuLinkedWithMenuItem(items[3])
      })
    )

    it(
      'should have no active menu item upon PageUp key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a", disabled: true }, "Item A"],
                [MenuItem, { as: "a", disabled: true }, "Item B"],
                [MenuItem, { as: "a", disabled: true }, "Item C"],
                [MenuItem, { as: "a", disabled: true }, "Item D"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        assertNoActiveMenuItem()
      })
    )
  })

  describe('`Any` key aka search', () => {
    it(
      'should be possible to type a full word that has a perfect match',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "alice"],
                [MenuItem, { as: "a" }, "bob"],
                [MenuItem, { as: "a" }, "charlie"],
              ]]
            ]],
          ]
        })

        // Open menu
        await click(getMenuButton())

        let items = getMenuItems()

        // We should be able to go to the second item
        await type(word('bob'))
        assertMenuLinkedWithMenuItem(items[1])

        // We should be able to go to the first item
        await type(word('alice'))
        assertMenuLinkedWithMenuItem(items[0])

        // We should be able to go to the last item
        await type(word('charlie'))
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should be possible to type a partial of a word',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "alice"],
                [MenuItem, { as: "a" }, "bob"],
                [MenuItem, { as: "a" }, "charlie"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        let items = getMenuItems()

        // We should be on the last item
        assertMenuLinkedWithMenuItem(items[2])

        // We should be able to go to the second item
        await type(word('bo'))
        assertMenuLinkedWithMenuItem(items[1])

        // We should be able to go to the first item
        await type(word('ali'))
        assertMenuLinkedWithMenuItem(items[0])

        // We should be able to go to the last item
        await type(word('char'))
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should be possible to type words with spaces',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "value a"],
                [MenuItem, { as: "a" }, "value b"],
                [MenuItem, { as: "a" }, "value c"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        let items = getMenuItems()

        // We should be on the last item
        assertMenuLinkedWithMenuItem(items[2])

        // We should be able to go to the second item
        await type(word('value b'))
        assertMenuLinkedWithMenuItem(items[1])

        // We should be able to go to the first item
        await type(word('value a'))
        assertMenuLinkedWithMenuItem(items[0])

        // We should be able to go to the last item
        await type(word('value c'))
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should not be possible to search for a disabled item',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "alice"],
                [MenuItem, { as: "a", disabled: true }, "bob"],
                [MenuItem, { as: "a" }, "charlie"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        let items = getMenuItems()

        // We should be on the last item
        assertMenuLinkedWithMenuItem(items[2])

        // We should not be able to go to the disabled item
        await type(word('bo'))

        // We should still be on the last item
        assertMenuLinkedWithMenuItem(items[2])
      })
    )
    it(
      'should be possible to search for a word (case insensitive)',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Menu, {}, [
              [MenuButton, {}, "Trigger"],
              [MenuItems, {}, [
                [MenuItem, { as: "a" }, "alice"],
                [MenuItem, { as: "a" }, "bob"],
                [MenuItem, { as: "a" }, "charlie"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        let items = getMenuItems()

        // We should be on the last item
        assertMenuLinkedWithMenuItem(items[2])

        // Search for bob in a different casing
        await type(word('BO'))

        // We should be on `bob`
        assertMenuLinkedWithMenuItem(items[1])
      })
    )

    it(
      'should be possible to search for the next occurence',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">alice</MenuItem>
              <MenuItem as="a">bob</MenuItem>
              <MenuItem as="a">charlie</MenuItem>
              <MenuItem as="a">bob</MenuItem>
            </MenuItems>
          </Menu>
        `)

        // Open menu
        await click(getMenuButton())

        let items = getMenuItems()

        // Search for bob
        await type(word('b'))

        // We should be on the first `bob`
        assertMenuLinkedWithMenuItem(items[1])

        // Search for bob again
        await type(word('b'))

        // We should be on the second `bob`
        assertMenuLinkedWithMenuItem(items[3])

        // Search for bob once again
        await type(word('b'))

        // We should be back on the first `bob`
        assertMenuLinkedWithMenuItem(items[1])
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to open a menu on click',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open menu
      await click(getMenuButton())

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
    })
  )

  it(
    'should not be possible to open a menu on right click',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Try to open the menu
      await click(getMenuButton(), MouseButton.Right)

      // Verify it is still closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open a menu on click when the button is disabled',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, { disabled: true }, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Try to open the menu
      await click(getMenuButton())

      // Verify it is still closed
      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close a menu on click',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })

      // Click to close
      await click(getMenuButton())

      // Verify it is closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })
  )

  it(
    'should be a no-op when we click outside of a closed menu',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Verify that the window is closed
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Click something that is not related to the menu
      await click(document.body)

      // Should still be closed
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to click outside of the menu which should close the menu',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      // Click something that is not related to the menu
      await click(document.body)

      // Should be closed now
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getMenuButton())
    })
  )

  it(
    'should be possible to click outside of the menu which should close the menu (even if we press the menu button)',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      // Click the menu button again
      await click(getMenuButton())

      // Should be closed now
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getMenuButton())
    })
  )

  it(
    'should be possible to click outside of the menu on another menu button which should close the current menu and open the new menu',
    suppressConsoleLogs(async () => {
      render(svelte`
        <div>
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
        </div>
      `)

      let [button1, button2] = getMenuButtons()

      // Click the first menu button
      await click(button1)
      expect(getMenus()).toHaveLength(1) // Only 1 menu should be visible

      // Ensure the open menu is linked to the first button
      assertMenuButtonLinkedWithMenu(button1, getMenu())

      // Click the second menu button
      await click(button2)

      expect(getMenus()).toHaveLength(1) // Only 1 menu should be visible

      // Ensure the open menu is linked to the second button
      assertMenuButtonLinkedWithMenu(button2, getMenu())
    })
  )

  // TODO: This test looks like it's for React-specific behavior (for some reason)
  it.skip(
    'should be possible to click outside of the menu, on an element which is within a focusable element, which closes the menu',
    suppressConsoleLogs(async () => {
      let focusFn = jest.fn()
      render(svelte`
        <div>
          <Menu>
            <MenuButton on:focus={focusFn}>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
          <button id="btn">
            <span>Next</span>
          </button>
        </div>
      `)

      // Click the menu button
      await click(getMenuButton())

      // Ensure the menu is open
      assertMenu({ state: MenuState.Visible })

      // Click the span inside the button
      await click(getByText('Next'))

      // Ensure the menu is closed
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Ensure the outside button is focused
      assertActiveElement(document.getElementById('btn'))

      // Ensure that the focus button only got focus once (first click)
      expect(focusFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should be possible to hover an item and make it active',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()
      // We should be able to go to the second item
      await mouseMove(items[1])
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go to the first item
      await mouseMove(items[0])
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last item
      await mouseMove(items[2])
      assertMenuLinkedWithMenuItem(items[2])
    })
  )

  it(
    'should make a menu item active when you move the mouse over it',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()
      // We should be able to go to the second item
      await mouseMove(items[1])
      assertMenuLinkedWithMenuItem(items[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the menu item is already active',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      // We should be able to go to the second item
      await mouseMove(items[1])
      assertMenuLinkedWithMenuItem(items[1])

      await mouseMove(items[1])

      // Nothing should be changed
      assertMenuLinkedWithMenuItem(items[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the menu item is disabled',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a", disabled: true }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      await mouseMove(items[1])
      assertNoActiveMenuItem()
    })
  )

  it(
    'should not be possible to hover an item that is disabled',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a", disabled: true }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      // Try to hover over item 1, which is disabled
      await mouseMove(items[1])

      // We should not have an active item now
      assertNoActiveMenuItem()
    })
  )

  it(
    'should be possible to mouse leave an item and make it inactive',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      // We should be able to go to the second item
      await mouseMove(items[1])
      assertMenuLinkedWithMenuItem(items[1])

      await mouseLeave(items[1])
      assertNoActiveMenuItem()

      // We should be able to go to the first item
      await mouseMove(items[0])
      assertMenuLinkedWithMenuItem(items[0])

      await mouseLeave(items[0])
      assertNoActiveMenuItem()

      // We should be able to go to the last item
      await mouseMove(items[2])
      assertMenuLinkedWithMenuItem(items[2])

      await mouseLeave(items[2])
      assertNoActiveMenuItem()
    })
  )

  it(
    'should be possible to mouse leave a disabled item and be a no-op',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a", disabled: true }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      // Try to hover over item 1, which is disabled
      await mouseMove(items[1])
      assertNoActiveMenuItem()

      await mouseLeave(items[1])
      assertNoActiveMenuItem()
    })
  )

  it(
    'should be possible to click a menu item, which closes the menu',
    suppressConsoleLogs(async () => {
      let clickHandler = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a", onClick: clickHandler }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      let items = getMenuItems()

      // We should be able to click the first item
      await click(items[1])

      assertMenu({ state: MenuState.InvisibleUnmounted })
      expect(clickHandler).toHaveBeenCalled()
    })
  )

  it(
    'should be possible to click a menu item, which closes the menu and invokes the @click handler',
    suppressConsoleLogs(async () => {
      let clickHandler = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "button", onClick: clickHandler }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      // We should be able to click the first item
      await click(getMenuItems()[1])
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify the callback has been called
      expect(clickHandler).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should be possible to click a disabled menu item, which is a no-op',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a", disabled: true }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      let items = getMenuItems()

      // We should be able to click the first item
      await click(items[1])
      assertMenu({ state: MenuState.Visible })
    })
  )

  it(
    'should be possible focus a menu item, so that it becomes active',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a" }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      let items = getMenuItems()

      // Verify that nothing is active yet
      assertNoActiveMenuItem()

      // We should be able to focus the first item
      await focus(items[1])
      assertMenuLinkedWithMenuItem(items[1])
    })
  )

  it(
    'should not be possible to focus a menu item which is disabled',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
              [MenuItem, { as: "a" }, "Item A"],
              [MenuItem, { as: "a", disabled: true }, "Item B"],
              [MenuItem, { as: "a" }, "Item C"],
            ]]
          ]],
        ]
      })

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      let items = getMenuItems()

      // We should not be able to focus the first item
      await focus(items[1])
      assertNoActiveMenuItem()
    })
  )

  it(
    'should not be possible to activate a disabled item',
    suppressConsoleLogs(async () => {
      let clickHandler = jest.fn()

      render(svelte`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" on:click={clickHandler}>Item A</MenuItem>
            <MenuItem as="a" on:click={clickHandler} disabled>Item B</MenuItem>
            <MenuItem disabled>
              <button on:click={clickHandler}>Item C</button>
            </MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      let items = getMenuItems()

      await focus(items[0])
      await click(items[1])
      expect(clickHandler).not.toHaveBeenCalled()

      // Activate the last item
      await click(getMenuItems()[2])
      expect(clickHandler).not.toHaveBeenCalled()
    })
  )

})
