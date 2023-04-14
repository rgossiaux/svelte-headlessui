import { assertActiveElement, assertContainsActiveElement, assertPopoverButton, assertPopoverPanel, getByText, getPopoverButton, getPopoverOverlay, getPopoverPanel, PopoverState } from "$lib/test-utils/accessibility-assertions";
import { render } from "@testing-library/svelte";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import TestRenderer from "$lib/test-utils/TestRenderer.svelte";
import { Popover, PopoverButton, PopoverGroup, PopoverOverlay, PopoverPanel } from ".";
import { click, Keys, MouseButton, press, shift } from "$lib/test-utils/interactions";
import A from "$lib/internal/elements/A.svelte";
import { Transition, TransitionChild } from "$lib/components/transitions";
import TransitionDebug from "$lib/components/disclosure/_TransitionDebug.svelte";
import Portal from "$lib/components/portal/Portal.svelte";
import svelte from "svelte-inline-compile";

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
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

describe('Safe guards', () => {
  it.each([
    ['PopoverButton', PopoverButton],
    ['PopoverPanel', PopoverPanel],
    ['PopoverOverlay', PopoverOverlay],
  ])(
    'should error when we are using a <%s /> without a parent <Popover />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Popover /> component.`
      )
    })
  )

  it(
    'should be possible to render a Popover without crashing',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, {}, "Trigger"],
            [PopoverPanel, {}, "Contents"]
          ]],
        ]
      })


      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('PopoverGroup', () => {
    it(
      'should be possible to render a Popover.Group with multiple Popover components',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [PopoverPanel, {}, "Panel 1"]
              ]],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [PopoverPanel, {}, "Panel 2"]
              ]],
            ]],
          ]
        })

        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted }, getByText('Panel 1'))
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted }, getByText('Panel 2'))

        await click(getByText('Trigger 1'))

        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        assertPopoverPanel({ state: PopoverState.Visible }, getByText('Panel 1'))
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted }, getByText('Panel 2'))

        await click(getByText('Trigger 2'))

        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 2'))

        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted }, getByText('Panel 1'))
        assertPopoverPanel({ state: PopoverState.Visible }, getByText('Panel 2'))
      })
    )
  })

  describe('Popover', () => {
    it(
      'should render a Popover with slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Popover let:open>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel>Panel is: {open ? 'open' : 'closed'}</PopoverPanel>
          </Popover>
        `)

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        await click(getPopoverButton())

        assertPopoverButton({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.Visible, textContent: 'Panel is: open' })
      })
    )

    it(
      'should expose a close function that closes the popover',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Popover let:close>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel>
              <button on:click={() => close()}>Close me</button>
            </PopoverPanel>
          </Popover>
        `)

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the popover is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Ensure the PopoverButton got the restored focus
        assertActiveElement(getByText('Trigger'))
      })
    )

    it(
      'should expose a close function that closes the popover and restores to a specific element',
      suppressConsoleLogs(async () => {
        render(svelte`
            <button id="test">restoreable</button>
            <Popover let:close>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>
                <button on:click={() => close(document.getElementById('test'))}>
                  Close me
                </button>
              </PopoverPanel>
            </Popover>
        `)

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the popover is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )
  })

  describe('PopoverButton', () => {
    it(
      'should render a PopoverButton with slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Popover>
            <PopoverButton let:open>{JSON.stringify({open})}</PopoverButton>
            <PopoverPanel></PopoverPanel>
          </Popover>
        `)

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        await click(getPopoverButton())

        assertPopoverButton({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertPopoverPanel({ state: PopoverState.Visible })
      })
    )

    it(
      'should render a PopoverButton with a slot prop and use an `as` prop',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Popover>
            <PopoverButton as="div" role="button" let:open>
              {JSON.stringify({ open })}
            </PopoverButton>
            <PopoverPanel />
          </Popover>
        `)

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        await click(getPopoverButton())

        assertPopoverButton({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertPopoverPanel({ state: PopoverState.Visible })
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
            ]],
          ]
        })

        expect(getPopoverButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, { type: "submit" }, "Trigger"],
            ]],
          ]
        })

        expect(getPopoverButton()).toHaveAttribute('type', 'submit')
      })

      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, { as: "div" }, "Trigger"],
          ]],
        ]
      })

      expect(getPopoverButton()).not.toHaveAttribute('type')
    })
  })

  describe('PopoverPanel', () => {
    it(
      'should render PopoverPanel with slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel let:open>{JSON.stringify({ open })}</PopoverPanel>
          </Popover>
        `)

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        await click(getPopoverButton())

        assertPopoverButton({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({
          state: PopoverState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )

    it('should be possible to always render the PopoverPanel if we provide it a `static` prop', () => {
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, {}, "Trigger"],
            [PopoverPanel, { static: true }, "Contents"]
          ]],
        ]
      })

      // Let's verify that the Popover is already there
      expect(getPopoverPanel()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the PopoverPanel', async () => {
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, {}, "Trigger"],
            [PopoverPanel, { unmount: false }, "Contents"]
          ]],
        ]
      })

      getPopoverButton()?.focus()

      assertPopoverButton({ state: PopoverState.InvisibleHidden })
      assertPopoverPanel({ state: PopoverState.InvisibleHidden })

      // Let's open the Popover, to see if it is not hidden anymore
      await click(getPopoverButton())

      assertPopoverButton({ state: PopoverState.Visible })
      assertPopoverPanel({ state: PopoverState.Visible })

      // Let's re-click the Popover, to see if it is hidden again
      await click(getPopoverButton())

      assertPopoverButton({ state: PopoverState.InvisibleHidden })
      assertPopoverPanel({ state: PopoverState.InvisibleHidden })
    })

    it(
      'should be possible to move the focus inside the panel to the first focusable element (very first link)',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, { focus: true }, [
                [A, { href: "/" }, "Link 1"]
              ]]
            ]],
          ]
        })

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure the active element is within the Panel
        assertContainsActiveElement(getPopoverPanel())
        assertActiveElement(getByText('Link 1'))
      })
    )

    // TODO: This test doesn't work but I'm also not totally sure it should... 
    // calling element.focus in the browser doesn't seem to call the window focus handler
    it.skip(
      'should close the Popover, when PopoverPanel has the focus prop and you focus the open button',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, { focus: true }, [
                [A, { href: "/" }, "Link 1"]
              ]]
            ]],
          ]
        })

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure the active element is within the Panel
        assertContainsActiveElement(getPopoverPanel())
        assertActiveElement(getByText('Link 1'))

        // Focus the button again
        getPopoverButton()?.focus()

        // Ensure the Popover is closed again
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to move the focus inside the panel to the first focusable element (skip hidden link)',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, { focus: true }, [
                [A, { href: "/", style: "display: none" }, "Link 1"],
                [A, { href: "/" }, "Link 2"]
              ]]
            ]],
          ]
        })

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure the active element is within the Panel
        assertContainsActiveElement(getPopoverPanel())
        assertActiveElement(getByText('Link 2'))
      })
    )

    it(
      'should be possible to move the focus inside the panel to the first focusable element (very first link) when the hidden render strategy is used',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, { focus: true, unmount: false }, [
                [A, { href: "/" }, "Link 1"],
              ]]
            ]],
          ]
        })

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure the active element is within the Panel
        assertContainsActiveElement(getPopoverPanel())
        assertActiveElement(getByText('Link 1'))
      })
    )

    it(
      'should expose a close function that closes the popover',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel let:close>
              <button on:click={() => close()}>Close me</button>
            </PopoverPanel>
          </Popover>
        `)

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the popover is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Ensure the PopoverButton got the restored focus
        assertActiveElement(getByText('Trigger'))
      })
    )

    it(
      'should expose a close function that closes the popover and restores to a specific element',
      suppressConsoleLogs(async () => {
        render(svelte`
          <button id="test">restoreable</button>
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel let:close>
              <button on:click={() => close(document.getElementById('test'))}>Close me</button>
            </PopoverPanel>
          </Popover>
        `)

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the popover is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )
  })
})

describe('Composition', () => {
  it(
    'should be possible to wrap the PopoverPanel with a Transition component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, {}, "Trigger"],
            [TransitionDebug, { name: "Popover", fn: orderFn }],
            [Transition, {}, [
              [TransitionDebug, { name: "Transition", fn: orderFn }],
              [PopoverPanel, {}, [
                [TransitionChild, {}, [
                  [TransitionDebug, { name: "TransitionChild", fn: orderFn }],
                ]],
              ]],
            ]],
          ]],
        ]
      })


      // Open the popover
      await click(getPopoverButton())

      // Close the popover
      await click(getPopoverButton())

      // Wait for all transitions to finish
      await nextFrame()

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      // Note that the unmounts happen in a different order in Svelte
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Popover'],
        ['Mounting - Transition'],
        ['Mounting - TransitionChild'],
        ['Unmounting - Transition'],
        ['Unmounting - TransitionChild'],
      ])
    })
  )
})


describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the Popover with Enter',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, {}, "Contents"]
            ]],
          ]
        })

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Open popover
        await press(Keys.Enter)

        // Verify it is open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-panel-2' },
        })

        // Close popover
        await press(Keys.Enter)
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should not be possible to open the popover with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, { disabled: true }, "Trigger"],
              [PopoverPanel, {}, "Contents"]
            ]],
          ]
        })

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Try to open the popover
        await press(Keys.Enter)

        // Verify it is still closed
        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the popover with Enter when the popover is open',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, {}, "Contents"]
            ]],
          ]
        })

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Open popover
        await press(Keys.Enter)

        // Verify it is open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-panel-2' },
        })

        // Close popover
        await press(Keys.Enter)

        // Verify it is closed again
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close other popover menus when we open a new one',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [PopoverPanel, {}, "Panel 1"]
              ]],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [PopoverPanel, {}, "Panel 2"]
              ]],
            ]],
          ]
        })

        // Open the first Popover
        await click(getByText('Trigger 1'))

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Focus trigger 2
        getByText('Trigger 2')?.focus()

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Open the second popover
        await press(Keys.Enter)

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 2'))
      })
    )

    it(
      'should close the Popover by pressing `Enter` on a PopoverButton inside a PopoverPanel',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Open"],
              [PopoverPanel, {}, [
                [PopoverButton, {}, "Close"]
              ]]
            ]],
          ]
        })

        // Open the popover
        await click(getPopoverButton())

        let closeBtn = getByText('Close')

        expect(closeBtn).not.toHaveAttribute('id')
        expect(closeBtn).not.toHaveAttribute('aria-controls')
        expect(closeBtn).not.toHaveAttribute('aria-expanded')

        // The close button should close the popover
        await press(Keys.Enter, closeBtn)

        // Verify it is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Verify we restored the Open button
        assertActiveElement(getPopoverButton())
      })
    )
  })

  describe('`Escape` key', () => {
    it(
      'should close the Popover menu, when pressing escape on the PopoverButton',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, {}, "Contents"]
            ]],
          ]
        })

        // Focus the button
        getPopoverButton()?.focus()

        // Verify popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

        // Open popover
        await click(getPopoverButton())

        // Verify popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Close popover
        await press(Keys.Escape)

        // Verify popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

        // Verify button is (still) focused
        assertActiveElement(getPopoverButton())
      })
    )

    it(
      'should close the Popover menu, when pressing escape on the PopoverPanel',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, {}, [
                [A, { href: "/" }, "Link"]
              ]]
            ]],
          ]
        })

        // Focus the button
        getPopoverButton()?.focus()

        // Verify popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

        // Open popover
        await click(getPopoverButton())

        // Verify popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Tab to next focusable item
        await press(Keys.Tab)

        // Verify the active element is inside the panel
        assertContainsActiveElement(getPopoverPanel())

        // Close popover
        await press(Keys.Escape)

        // Verify popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

        // Verify button is focused again
        assertActiveElement(getPopoverButton())
      })
    )

    it(
      'should be possible to close a sibling Popover when pressing escape on a sibling PopoverButton',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [PopoverPanel, {}, "Panel 1"]
              ]],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [PopoverPanel, {}, "Panel 2"]
              ]],
            ]],
          ]
        })

        // Focus the button of the first Popover
        getByText('Trigger 1')?.focus()

        // Verify popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Open popover
        await click(getByText('Trigger 1'))

        // Verify popover is open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        assertPopoverPanel({ state: PopoverState.Visible }, getByText('Panel 1'))
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted }, getByText('Panel 2'))

        // Focus the button of the second popover menu
        getByText('Trigger 2')?.focus()

        // Close popover
        await press(Keys.Escape)

        // Verify both popovers are closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Verify the button of the second popover is still focused
        assertActiveElement(getByText('Trigger 2'))
      })
    )
  })

  describe('`Tab` key', () => {
    it(
      'should be possible to Tab through the panel contents onto the next PopoverButton',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [PopoverPanel, {}, [
                  [A, { href: "/" }, "Link 1"],
                  [A, { href: "/" }, "Link 2"],
                ]],
              ]],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [PopoverPanel, {}, "Panel 2"]
              ]],
            ]],
          ]
        })

        // Focus the button of the first Popover
        getByText('Trigger 1')?.focus()

        // Open popover
        await click(getByText('Trigger 1'))

        // Verify we are focused on the first link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 1'))

        // Verify we are focused on the second link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 2'))

        // Let's Tab again
        await press(Keys.Tab)

        // Verify that the first Popover is still open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({ state: PopoverState.Visible })

        // Verify that the second button is focused
        assertActiveElement(getByText('Trigger 2'))
      })
    )

    it(
      'should be possible to place a focusable item in the Popover.Group, and keep the Popover open when we focus the focusable element',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [PopoverPanel, {}, [
                  [A, { href: "/" }, "Link 1"],
                  [A, { href: "/" }, "Link 2"],
                ]],
              ]],
              [A, { href: "/" }, "Link in between"],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [PopoverPanel, {}, "Panel 2"]
              ]],
            ]],
          ]
        })

        // Focus the button of the first Popover
        getByText('Trigger 1')?.focus()

        // Open popover
        await click(getByText('Trigger 1'))

        // Verify we are focused on the first link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 1'))

        // Verify we are focused on the second link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 2'))

        // Let's Tab to the in between link
        await press(Keys.Tab)

        // Verify that the first Popover is still open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({ state: PopoverState.Visible })

        // Verify that the in between link is focused
        assertActiveElement(getByText('Link in between'))
      })
    )

    it(
      'should close the Popover menu once we Tab out of the Popover.Group',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [PopoverPanel, {}, [
                  [A, { href: "/" }, "Link 1"],
                  [A, { href: "/" }, "Link 2"],
                ]],
              ]],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [PopoverPanel, {}, [
                  [A, { href: "/" }, "Link 3"],
                  [A, { href: "/" }, "Link 4"],
                ]],
              ]],
            ]],
            [A, { href: "/" }, "Next"],
          ]
        })

        // Focus the button of the first Popover
        getByText('Trigger 1')?.focus()

        // Open popover
        await click(getByText('Trigger 1'))

        // Verify we are focused on the first link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 1'))

        // Verify we are focused on the second link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 2'))

        // Let's Tab again
        await press(Keys.Tab)

        // Verify that the first Popover is still open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({ state: PopoverState.Visible })

        // Verify that the second button is focused
        assertActiveElement(getByText('Trigger 2'))

        // Let's Tab out of the Popover.Group
        await press(Keys.Tab)

        // Verify the next link is now focused
        assertActiveElement(getByText('Next'))

        // Verify the popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close the Popover menu once we Tab out of the Popover',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger 1"],
              [PopoverPanel, {}, [
                [A, { href: "/" }, "Link 1"],
                [A, { href: "/" }, "Link 2"],
              ]]
            ]],
            [A, { href: "/" }, "Next"],
          ]
        })

        // Focus the button of the first Popover
        getByText('Trigger 1')?.focus()

        // Open popover
        await click(getByText('Trigger 1'))

        // Verify we are focused on the first link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 1'))

        // Verify we are focused on the second link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 2'))

        // Let's Tab out of the Popover
        await press(Keys.Tab)

        // Verify the next link is now focused
        assertActiveElement(getByText('Next'))

        // Verify the popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close the Popover when the PopoverPanel has a focus prop',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [A, { href: "/" }, "Previous"],
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, { focus: true }, [
                [A, { href: "/" }, "Link 1"],
                [A, { href: "/" }, "Link 2"],
              ]]
            ]],
            [A, { href: "/" }, "Next"],
          ]
        })

        // Open the popover
        await click(getPopoverButton())

        // Focus should be within the panel
        assertContainsActiveElement(getPopoverPanel())

        // Tab out of the component
        await press(Keys.Tab) // Tab to link 1
        await press(Keys.Tab) // Tab out

        // The popover should be closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // The active element should be the Next link outside of the popover
        assertActiveElement(getByText('Next'))
      })
    )

    it(
      'should close the Popover when the PopoverPanel has a focus prop (PopoverPanel uses a Portal)',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [A, { href: "/" }, "Previous"],
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [Portal, {}, [
                [PopoverPanel, { focus: true }, [
                  [A, { href: "/" }, "Link 1"],
                  [A, { href: "/" }, "Link 2"],
                ]],
              ]],
            ]],
            [A, { href: "/" }, "Next"],
          ]
        })

        // Open the popover
        await click(getPopoverButton())

        // Focus should be within the panel
        assertContainsActiveElement(getPopoverPanel())

        // The focus should be on the first link
        assertActiveElement(getByText('Link 1'))

        // Tab to the next link
        await press(Keys.Tab)

        // The focus should be on the second link
        assertActiveElement(getByText('Link 2'))

        // Tab out of the component
        await press(Keys.Tab)

        // The popover should be closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // The active element should be the Next link outside of the popover
        assertActiveElement(getByText('Next'))
      })
    )

    it(
      'should close the Popover when the PopoverPanel has a focus prop (PopoverPanel uses a Portal), and focus the next focusable item in line',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [A, { href: "/" }, "Previous"],
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [Portal, {}, [
                [PopoverPanel, { focus: true }, [
                  [A, { href: "/" }, "Link 1"],
                  [A, { href: "/" }, "Link 2"],
                ]],
              ]],
            ]],
          ]
        })

        // Open the popover
        await click(getPopoverButton())

        // Focus should be within the panel
        assertContainsActiveElement(getPopoverPanel())

        // The focus should be on the first link
        assertActiveElement(getByText('Link 1'))

        // Tab to the next link
        await press(Keys.Tab)

        // The focus should be on the second link
        assertActiveElement(getByText('Link 2'))

        // Tab out of the component
        await press(Keys.Tab)

        // The popover should be closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // The active element should be the Previous link outside of the popover, this is the next one in line
        assertActiveElement(getByText('Previous'))
      })
    )
  })

  describe('`Shift+Tab` key', () => {
    it(
      'should close the Popover menu once we Tab out of the Popover.Group',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [A, { href: "/" }, "Previous"],
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [PopoverPanel, {}, [
                  [A, { href: "/" }, "Link 1"],
                  [A, { href: "/" }, "Link 2"],
                ]],
              ]],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [PopoverPanel, {}, [
                  [A, { href: "/" }, "Link 3"],
                  [A, { href: "/" }, "Link 4"],
                ]],
              ]],
            ]],
          ]
        })

        // Focus the button of the second Popover
        getByText('Trigger 2')?.focus()

        // Open popover
        await click(getByText('Trigger 2'))

        // Verify we can tab to Trigger 1
        await press(shift(Keys.Tab))
        assertActiveElement(getByText('Trigger 1'))

        // Let's Tab out of the Popover.Group
        await press(shift(Keys.Tab))

        // Verify the previous link is now focused
        assertActiveElement(getByText('Previous'))

        // Verify the popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close the Popover menu once we Tab out of the Popover',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [A, { href: "/" }, "Previous"],
            [Popover, {}, [
              [PopoverButton, {}, "Trigger 1"],
              [PopoverPanel, {}, [
                [A, { href: "/" }, "Link 1"],
                [A, { href: "/" }, "Link 2"],
              ]]
            ]],
          ]
        })

        // Focus the button of the Popover
        getPopoverButton()?.focus()

        // Open popover
        await click(getPopoverButton())

        // Let's Tab out of the Popover
        await press(shift(Keys.Tab))

        // Verify the previous link is now focused
        assertActiveElement(getByText('Previous'))

        // Verify the popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should focus the previous PopoverButton when Shift+Tab on the second PopoverButton',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [PopoverPanel, {}, [
                  [A, { href: "/" }, "Link 1"],
                  [A, { href: "/" }, "Link 2"],
                ]],
              ]],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [PopoverPanel, {}, [
                  [A, { href: "/" }, "Link 3"],
                  [A, { href: "/" }, "Link 4"],
                ]],
              ]],
            ]],
          ]
        })

        // Open the second popover
        await click(getByText('Trigger 2'))

        // Ensure the second popover is open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 2'))

        // Close the popover
        await press(Keys.Escape)

        // Ensure the popover is now closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Ensure the second PopoverButton is focused
        assertActiveElement(getByText('Trigger 2'))

        // Tab backwards
        await press(shift(Keys.Tab))

        // Ensure the first PopoverButton is open
        assertActiveElement(getByText('Trigger 1'))
      })
    )

    it(
      'should focus the PopoverButton when pressing Shift+Tab when we focus inside the PopoverPanel',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger 1"],
              [PopoverPanel, { focus: true }, [
                [A, { href: "/" }, "Link 1"],
                [A, { href: "/" }, "Link 2"],
              ]]
            ]],
          ]
        })

        // Open the popover
        await click(getPopoverButton())

        // Ensure the popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Ensure the Link 1 is focused
        assertActiveElement(getByText('Link 1'))

        // Tab out of the Panel
        await press(shift(Keys.Tab))

        // Ensure the PopoverButton is focused again
        assertActiveElement(getPopoverButton())

        // Ensure the Popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should focus the PopoverButton when pressing Shift+Tab when we focus inside the PopoverPanel (inside a Portal)',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger 1"],
              [Portal, {}, [
                [PopoverPanel, { focus: true }, [
                  [A, { href: "/" }, "Link 1"],
                  [A, { href: "/" }, "Link 2"],
                ]],
              ]],
            ]],
          ]
        })

        // Open the popover
        await click(getPopoverButton())

        // Ensure the popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Ensure the Link 1 is focused
        assertActiveElement(getByText('Link 1'))

        // Tab out of the Panel
        await press(shift(Keys.Tab))

        // Ensure the PopoverButton is focused again
        assertActiveElement(getPopoverButton())

        // Ensure the Popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to focus the last item in the PopoverPanel when pressing Shift+Tab on the next PopoverButton',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [PopoverPanel, {}, [
                  [A, { href: "/" }, "Link 1"],
                  [A, { href: "/" }, "Link 2"],
                ]],
              ]],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [PopoverPanel, {}, [
                  [A, { href: "/" }, "Link 3"],
                  [A, { href: "/" }, "Link 4"],
                ]],
              ]],
            ]],
          ]
        })

        // Open the popover
        await click(getByText('Trigger 1'))

        // Ensure the popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Focus the second button
        getByText('Trigger 2')?.focus()

        // Verify the second button is focused
        assertActiveElement(getByText('Trigger 2'))

        // Ensure the first Popover is still open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({ state: PopoverState.Visible })

        // Press shift+tab, to move focus to the last item in the PopoverPanel
        await press(shift(Keys.Tab), getByText('Trigger 2'))

        // Verify we are focusing the last link of the first Popover
        assertActiveElement(getByText('Link 2'))
      })
    )

    it(
      "should be possible to focus the last item in the PopoverPanel when pressing Shift+Tab on the next PopoverButton (using Portal's)",
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [Portal, {}, [
                  [PopoverPanel, {}, [
                    [A, { href: "/" }, "Link 1"],
                    [A, { href: "/" }, "Link 2"],
                  ]],
                ]],
              ]],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [Portal, {}, [
                  [PopoverPanel, {}, [
                    [A, { href: "/" }, "Link 3"],
                    [A, { href: "/" }, "Link 4"],
                  ]],
                ]],
              ]],
            ]],
          ]
        })

        // Open the popover
        await click(getByText('Trigger 1'))

        // Ensure the popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Focus the second button
        getByText('Trigger 2')?.focus()

        // Verify the second button is focused
        assertActiveElement(getByText('Trigger 2'))

        // Ensure the first Popover is still open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({ state: PopoverState.Visible })

        // Press shift+tab, to move focus to the last item in the PopoverPanel
        await press(shift(Keys.Tab), getByText('Trigger 2'))

        // Verify we are focusing the last link of the first Popover
        assertActiveElement(getByText('Link 2'))
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the popover with Space',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, {}, "Contents"]
            ]],
          ]
        })

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Open popover
        await press(Keys.Space)

        // Verify it is open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-panel-2' },
        })
      })
    )

    it(
      'should not be possible to open the popover with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, { disabled: true }, "Trigger"],
              [PopoverPanel, {}, "Contents"]
            ]],
          ]
        })

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Try to open the popover
        await press(Keys.Space)

        // Verify it is still closed
        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the popover with Space when the popover is open',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Trigger"],
              [PopoverPanel, {}, "Contents"]
            ]],
          ]
        })

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Open popover
        await press(Keys.Space)

        // Verify it is open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-panel-2' },
        })

        // Close popover
        await press(Keys.Space)

        // Verify it is closed again
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close other popover menus when we open a new one',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [PopoverGroup, {}, [
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 1"],
                [PopoverPanel, {}, "Panel 1"],
              ]],
              [Popover, {}, [
                [PopoverButton, {}, "Trigger 2"],
                [PopoverPanel, {}, "Panel 2"],
              ]],
            ]],
          ]
        })

        // Open the first Popover
        await click(getByText('Trigger 1'))

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Focus trigger 2
        getByText('Trigger 2')?.focus()

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Open the second popover
        await press(Keys.Space)

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 2'))
      })
    )

    it(
      'should close the Popover by pressing `Space` on a PopoverButton inside a PopoverPanel',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [Popover, {}, [
              [PopoverButton, {}, "Open"],
              [PopoverPanel, {}, [
                [PopoverButton, {}, "Close"]
              ]],
            ]],
          ]
        })

        // Open the popover
        await click(getPopoverButton())

        let closeBtn = getByText('Close')

        expect(closeBtn).not.toHaveAttribute('id')
        expect(closeBtn).not.toHaveAttribute('aria-controls')
        expect(closeBtn).not.toHaveAttribute('aria-expanded')

        // The close button should close the popover
        await press(Keys.Space, closeBtn)

        // Verify it is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Verify we restored the Open button
        assertActiveElement(getPopoverButton())
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to open a popover on click',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, {}, "Trigger"],
            [PopoverPanel, {}, "Contents"]
          ]],
        ]
      })

      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })
      assertPopoverPanel({
        state: PopoverState.Visible,
        attributes: { id: 'headlessui-popover-panel-2' },
      })
    })
  )

  it(
    'should not be possible to open a popover on right click',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, {}, "Trigger"],
            [PopoverPanel, {}, "Contents"]
          ]],
        ]
      })

      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

      // Open popover
      await click(getPopoverButton(), MouseButton.Right)

      // Verify it is still closed
      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open a popover on click when the button is disabled',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, { disabled: true }, "Trigger"],
            [PopoverPanel, {}, "Contents"]
          ]],
        ]
      })

      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

      // Try to open the popover
      await click(getPopoverButton())

      // Verify it is still closed
      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close a popover on click',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, {}, "Trigger"],
            [PopoverPanel, {}, "Contents"]
          ]],
        ]
      })

      getPopoverButton()?.focus()

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click to close
      await click(getPopoverButton())

      // Verify it is closed
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close a Popover using a click on the Popover.Overlay',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, {}, "Trigger"],
            [PopoverPanel, {}, "Contents"],
            [PopoverOverlay],
          ]],
        ]
      })

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click the overlay to close
      await click(getPopoverOverlay())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close the popover, and re-focus the button when we click outside on the body element',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, {}, "Trigger"],
            [PopoverPanel, {}, "Contents"]
          ]],
        ]
      })

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click the body to close
      await click(document.body)

      // Verify it is closed
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getPopoverButton())
    })
  )

  it(
    'should be possible to close the popover, and re-focus the button when we click outside on a non-focusable element',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Popover>
          <PopoverButton>Trigger</PopoverButton>
          <PopoverPanel>Contents</PopoverPanel>
        </Popover>
        <span>I am just text</span>
      `)

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click the span to close
      await click(getByText('I am just text'))

      // Verify it is closed
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getPopoverButton())
    })
  )

  it(
    'should be possible to close the popover, by clicking outside the popover on another focusable element',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Popover>
          <PopoverButton>Trigger</PopoverButton>
          <PopoverPanel>Contents</PopoverPanel>
        </Popover>
        <button>Different button</button>
      `)

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click the extra button to close
      await click(getByText('Different button'))

      // Verify it is closed
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

      // Verify the other button is focused
      assertActiveElement(getByText('Different button'))
    })
  )

  it(
    'should be possible to close the popover, by clicking outside the popover on another element inside a focusable element',
    suppressConsoleLogs(async () => {
      let focusFn = jest.fn()
      render(svelte`
        <Popover>
          <PopoverButton on:focus={focusFn}>Trigger</PopoverButton>
          <PopoverPanel>Contents</PopoverPanel>
        </Popover>
        <button id="btn">
          <span>Different button</span>
        </button>
      `)

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click the span inside the extra button to close
      await click(getByText('Different button'))

      // Verify it is closed
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

      // Verify the other button is focused
      assertActiveElement(document.getElementById('btn'))

      // Ensure that the focus button only got focus once (first click)
      expect(focusFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should be possible to close the Popover by clicking on a PopoverButton inside a PopoverPanel',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Popover, {}, [
            [PopoverButton, {}, "Open"],
            [PopoverPanel, {}, [
              [PopoverButton, {}, "Close"],
            ]],
          ]],
        ]
      })

      // Open the popover
      await click(getPopoverButton())

      let closeBtn = getByText('Close')

      expect(closeBtn).not.toHaveAttribute('id')
      expect(closeBtn).not.toHaveAttribute('aria-controls')
      expect(closeBtn).not.toHaveAttribute('aria-expanded')

      // The close button should close the popover
      await click(closeBtn)

      // Verify it is closed
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

      // Verify we restored the Open button
      assertActiveElement(getPopoverButton())
    })
  )

  it(
    'should not close the Popover when clicking on a focusable element inside a static PopoverPanel',
    suppressConsoleLogs(async () => {
      let clickFn = jest.fn()

      render(svelte`
        <Popover>
          <PopoverButton>Open</PopoverButton>
          <PopoverPanel static>
            <button on:click={clickFn}>btn</button>
          </PopoverPanel>
        </Popover>
      `)

      // Open the popover
      await click(getPopoverButton())

      // The button should not close the popover
      await click(getByText('btn'))

      // Verify it is still open
      assertPopoverButton({ state: PopoverState.Visible })

      // Verify we actually clicked the button
      expect(clickFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should not close the Popover when clicking on a non-focusable element inside a static PopoverPanel',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Popover>
          <PopoverButton>Open</PopoverButton>
          <PopoverPanel static>
            <span>element</span>
          </PopoverPanel>
        </Popover>
      `)

      // Open the popover
      await click(getPopoverButton())

      // The element should not close the popover
      await click(getByText('element'))

      // Verify it is still open
      assertPopoverButton({ state: PopoverState.Visible })
    })
  )

  it(
    'should close the Popover when clicking outside of a static PopoverPanel',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Popover>
          <PopoverButton>Open</PopoverButton>
          <PopoverPanel static>
            <span>element</span>
          </PopoverPanel>
        </Popover>
      `)

      // Open the popover
      await click(getPopoverButton())

      // The element should close the popover
      await click(document.body)

      // Verify it is still open
      assertPopoverButton({ state: PopoverState.InvisibleHidden })
    })
  )
})
