import { assertActiveElement, assertMenu, assertMenuButton, assertMenuButtonLinkedWithMenu, assertMenuItem, assertMenuLinkedWithMenuItem, assertNoActiveMenuItem, getMenu, getMenuButton, getMenuItems, MenuState } from "$lib/test-utils/accessibility-assertions";
import { render } from "@testing-library/svelte";
import { Menu, MenuButton, MenuItem, MenuItems } from ".";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import TestRenderer from "$lib/test-utils/TestRenderer.svelte";
import { click, Keys, mouseMove, press } from "$lib/test-utils/interactions";
import { Transition, TransitionChild } from "../transitions";
import TransitionDebug from "$lib/components/disclosure/_TransitionDebug.svelte";
import Div from "$lib/internal/elements/Div.svelte";
import Form from "$lib/internal/elements/Form.svelte";

let id = 0;
jest.mock('../../hooks/use-id', () => {
  return {
    useId: jest.fn(() => ++id),
  }
})

beforeEach(() => id = 0)
beforeAll(() => {
  // jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  // jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})
afterAll(() => jest.restoreAllMocks())

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
  // describe('Menu', () => {
  // it(
  //   'should be possible to render a Menu using a render prop',
  //   suppressConsoleLogs(async () => {
  //     render(
  //       <Menu>
  //         {({ open }) => (
  //           <>
  //             <Menu.Button>Trigger</Menu.Button>
  //             {open && (
  //               <Menu.Items>
  //                 <Menu.Item as="a">Item A</Menu.Item>
  //                 <Menu.Item as="a">Item B</Menu.Item>
  //                 <Menu.Item as="a">Item C</Menu.Item>
  //               </Menu.Items>
  //             )}
  //           </>
  //         )}
  //       </Menu>
  //     )

  //     assertMenuButton({
  //       state: MenuState.InvisibleUnmounted,
  //       attributes: { id: 'headlessui-menu-button-1' },
  //     })
  //     assertMenu({ state: MenuState.InvisibleUnmounted })

  //     await click(getMenuButton())

  //     assertMenuButton({
  //       state: MenuState.Visible,
  //       attributes: { id: 'headlessui-menu-button-1' },
  //     })
  //     assertMenu({ state: MenuState.Visible })
  //   })
  // )
  // })

  describe('Menu.Button', () => {
    // it(
    //   'should be possible to render a Menu.Button using a render prop',
    //   suppressConsoleLogs(async () => {
    //     render(
    //       <Menu>
    //         <Menu.Button>{JSON.stringify}</Menu.Button>
    //         <Menu.Items>
    //           <Menu.Item as="a">Item A</Menu.Item>
    //           <Menu.Item as="a">Item B</Menu.Item>
    //           <Menu.Item as="a">Item C</Menu.Item>
    //         </Menu.Items>
    //       </Menu>
    //     )

    //     assertMenuButton({
    //       state: MenuState.InvisibleUnmounted,
    //       attributes: { id: 'headlessui-menu-button-1' },
    //       textContent: JSON.stringify({ open: false }),
    //     })
    //     assertMenu({ state: MenuState.InvisibleUnmounted })

    //     await click(getMenuButton())

    //     assertMenuButton({
    //       state: MenuState.Visible,
    //       attributes: { id: 'headlessui-menu-button-1' },
    //       textContent: JSON.stringify({ open: true }),
    //     })
    //     assertMenu({ state: MenuState.Visible })
    //   })
    // )

    // it(
    //   'should be possible to render a Menu.Button using a render prop and an `as` prop',
    //   suppressConsoleLogs(async () => {
    //     render(
    //       <Menu>
    //         <Menu.Button as="div" role="button">
    //           {JSON.stringify}
    //         </Menu.Button>
    //         <Menu.Items>
    //           <Menu.Item as="a">Item A</Menu.Item>
    //           <Menu.Item as="a">Item B</Menu.Item>
    //           <Menu.Item as="a">Item C</Menu.Item>
    //         </Menu.Items>
    //       </Menu>
    //     )

    //     assertMenuButton({
    //       state: MenuState.InvisibleUnmounted,
    //       attributes: { id: 'headlessui-menu-button-1' },
    //       textContent: JSON.stringify({ open: false }),
    //     })
    //     assertMenu({ state: MenuState.InvisibleUnmounted })

    //     await click(getMenuButton())

    //     assertMenuButton({
    //       state: MenuState.Visible,
    //       attributes: { id: 'headlessui-menu-button-1' },
    //       textContent: JSON.stringify({ open: true }),
    //     })
    //     assertMenu({ state: MenuState.Visible })
    //   })
    // )

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

  describe('Menu.Items', () => {
    // it(
    //   'should be possible to render Menu.Items using a render prop',
    //   suppressConsoleLogs(async () => {
    //     render(
    //       <Menu>
    //         <Menu.Button>Trigger</Menu.Button>
    //         <Menu.Items>
    //           {data => (
    //             <>
    //               <Menu.Item as="a">{JSON.stringify(data)}</Menu.Item>
    //             </>
    //           )}
    //         </Menu.Items>
    //       </Menu>
    //     )

    //     assertMenuButton({
    //       state: MenuState.InvisibleUnmounted,
    //       attributes: { id: 'headlessui-menu-button-1' },
    //     })
    //     assertMenu({ state: MenuState.InvisibleUnmounted })

    //     await click(getMenuButton())

    //     assertMenuButton({
    //       state: MenuState.Visible,
    //       attributes: { id: 'headlessui-menu-button-1' },
    //     })
    //     assertMenu({
    //       state: MenuState.Visible,
    //       textContent: JSON.stringify({ open: true }),
    //     })
    //   })
    // )

    it('should be possible to always render the Menu.Items if we provide it a `static` prop', () => {
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

    it('should be possible to use a different render strategy for the Menu.Items', async () => {
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

  // describe('Menu.Item', () => {
  // it(
  //   'should be possible to render a Menu.Item using a render prop',
  //   suppressConsoleLogs(async () => {
  //     render(
  //       <Menu>
  //         <Menu.Button>Trigger</Menu.Button>
  //         <Menu.Items>
  //           <Menu.Item as="a">{JSON.stringify}</Menu.Item>
  //         </Menu.Items>
  //       </Menu>
  //     )

  //     assertMenuButton({
  //       state: MenuState.InvisibleUnmounted,
  //       attributes: { id: 'headlessui-menu-button-1' },
  //     })
  //     assertMenu({ state: MenuState.InvisibleUnmounted })

  //     await click(getMenuButton())

  //     assertMenuButton({
  //       state: MenuState.Visible,
  //       attributes: { id: 'headlessui-menu-button-1' },
  //     })
  //     assertMenu({
  //       state: MenuState.Visible,
  //       textContent: JSON.stringify({ active: false, disabled: false }),
  //     })
  //   })
  // )
  // })
})

describe('Rendering composition', () => {
  it(
    'should be possible to conditionally render classes (aka class can be a function?!)',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [MenuItems, {}, [
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

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      // Verify correct classNames
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
    'should mark all the elements between Menu.Items and Menu.Item with role none',
    suppressConsoleLogs(async () => {
      render
      render(
        TestRenderer, {
        allProps: [
          [Menu, {}, [
            [MenuButton, {}, "Trigger"],
            [Div, { class: "outer" }, [
              [MenuItems, {}, [
                [Div, { class: "py-1 inner" }, [
                  [MenuItem, { as: "button" }, "Item A"],
                  [MenuItem, { as: "button" }, "Item B"],
                ]],
                [Div, { class: "py-1 inner" }, [
                  [MenuItem, { as: "button" }, "Item C"],
                  [MenuItem, {}, [
                    [Div, {}, [
                      [Div, { class: "outer" }, "Item D"]
                    ]]
                  ]]
                ]],
                [Div, { class: "py-1 inner" }, [
                  [Form, { class: "inner" }, [
                    [MenuItem, { as: "button" }, "Item E"]
                  ]]
                ]]
              ]]
            ]]
          ]],
        ]
      })

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
  it.skip(
    'should be possible to wrap the Menu.Items with a Transition component',
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

  it.skip(
    'should be possible to wrap the Menu.Items with a Transition.Child component',
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
  })

})
