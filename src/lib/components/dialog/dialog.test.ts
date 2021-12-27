import { Dialog, DialogDescription, DialogOverlay, DialogTitle } from "."
import TestTabSentinel from "./_TestTabSentinel.svelte";
import ManagedDialog from "./_ManagedDialog.svelte";
import NestedTestComponent from "./_NestedTestComponent.svelte";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import { render } from "@testing-library/svelte";
import TestRenderer from "$lib/test-utils/TestRenderer.svelte";
import Button from "$lib/internal/elements/Button.svelte";
import Div from "$lib/internal/elements/Div.svelte";
import Form from "$lib/internal/elements/Form.svelte";
import P from "$lib/internal/elements/P.svelte";
import Input from "$lib/internal/elements/Input.svelte";
import { assertActiveElement, assertDialog, assertDialogDescription, DialogState, getByText, getDialog, getDialogOverlay, getDialogOverlays, getDialogs } from "$lib/test-utils/accessibility-assertions";
import { click, Keys, press } from "$lib/test-utils/interactions";
import Transition from "$lib/components/transitions/TransitionRoot.svelte";
import { tick } from "svelte";

let id = 0;
jest.mock('../../hooks/use-id', () => {
  return {
    useId: jest.fn(() => ++id),
  }
})

// @ts-expect-error
global.IntersectionObserver = class FakeIntersectionObserver {
  observe() { }
  disconnect() { }
}

beforeEach(() => id = 0)
afterAll(() => jest.restoreAllMocks())

describe('Safe guards', () => {
  it.each([
    ['DialogOverlay', DialogOverlay],
    ['DialogTitle', DialogTitle],
  ])(
    'should error when we are using a <%s /> without a parent <Dialog />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Dialog /> component.`
      )
      expect.hasAssertions()
    })
  )

  it(
    'should be possible to render a Dialog without crashing',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          Dialog,
          { open: false, onClose: console.log },
          [
            [Button,
              {},
              "Trigger"],
            [DialogOverlay],
            [DialogTitle],
            [P, {}, "Contents"],
            [DialogDescription]
          ]
        ]
      })

      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Dialog', () => {
    it(
      'should complain when the `open` and `onClose` prop are missing',
      suppressConsoleLogs(async () => {
        expect(() => render(Dialog, { as: "div" })).toThrowErrorMatchingInlineSnapshot(
          `"You forgot to provide an \`open\` prop to the \`Dialog\` component."`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should complain when an `open` prop is not a boolean',
      suppressConsoleLogs(async () => {
        expect(() =>
          render(
            TestRenderer, {
            allProps: [
              Dialog,
              { open: null, onClose: console.log, as: "div" },
            ]
          })
        ).toThrowErrorMatchingInlineSnapshot(
          `"You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: null"`
        )
        expect.hasAssertions()
      })
    )

    // TODO: render prop tests!

    // it(
    //   'should be possible to render a Dialog using a render prop',
    //   suppressConsoleLogs(async () => {
    //     function Example() {
    //       let [isOpen, setIsOpen] = useState(false)

    //       return (
    //         <>
    //         <button id= "trigger" onClick = {() => setIsOpen(true)
    //     }>
    //       Trigger
    //       < /button>
    //       < Dialog open = { isOpen } onClose = { setIsOpen } >
    //         { data => (
    //           <>
    //           <pre>{ JSON.stringify(data) } < /pre>
    //           < TabSentinel />
    //           </>
    //         )
    //   }
    //           </Dialog>
    //     < />
    //   )
    //     }
    // render(<Example />)

    //     assertDialog({ state: DialogState.InvisibleUnmounted })

    //     await click(document.getElementById('trigger'))

    //     assertDialog({ state: DialogState.Visible, textContent: JSON.stringify({ open: true }) })
    //   })
    // )

    it('should be possible to always render the Dialog if we provide it a `static` prop (and enable focus trapping based on `open`)', async () => {
      let focusCounter = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [Button, {}, "Trigger"],
          [Dialog, { open: true, onClose: console.log, static: true }, [
            [P, {}, "Contents"],
            [TestTabSentinel, { onFocus: focusCounter }]
          ]],
        ]
      })

      // Wait for the focus to take effect
      await tick();
      // Let's verify that the Dialog is already there
      expect(getDialog()).not.toBe(null)
      expect(focusCounter).toHaveBeenCalledTimes(1)
    })

    it('should be possible to always render the Dialog if we provide it a `static` prop (and disable focus trapping based on `open`)', () => {
      let focusCounter = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [Button, {}, "Trigger"],
          [Dialog, { open: false, onClose: console.log, static: true }, [
            [P, {}, "Contents"],
            [TestTabSentinel, { onFocus: focusCounter }]
          ]],
        ]
      })


      // Let's verify that the Dialog is already there
      expect(getDialog()).not.toBe(null)
      expect(focusCounter).toHaveBeenCalledTimes(0)
    })

    it('should be possible to use a different render strategy for the Dialog', async () => {
      let focusCounter = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [ManagedDialog, { unmount: false, buttonText: "Trigger", buttonProps: { id: "trigger" } }, [
            [Input, { onFocus: focusCounter }],
          ]],
        ]
      })

      assertDialog({ state: DialogState.InvisibleHidden })
      expect(focusCounter).toHaveBeenCalledTimes(0)

      // Let's open the Dialog, to see if it is not hidden anymore
      await click(document.getElementById('trigger'))
      expect(focusCounter).toHaveBeenCalledTimes(1)

      assertDialog({ state: DialogState.Visible })

      // Let's close the Dialog
      await press(Keys.Escape)
      expect(focusCounter).toHaveBeenCalledTimes(1)

      assertDialog({ state: DialogState.InvisibleHidden })
    })

    it(
      'should add a scroll lock to the html tag',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [ManagedDialog, { buttonText: "Trigger", buttonProps: { id: "trigger" } }, [
              [Input, { id: "a", type: "text" }],
              [Input, { id: "b", type: "text" }],
              [Input, { id: "c", type: "text" }],
            ]],
          ]
        })


        // No overflow yet
        expect(document.documentElement.style.overflow).toBe('')

        let btn = document.getElementById('trigger')

        // Open the dialog
        await click(btn)

        // Expect overflow
        expect(document.documentElement.style.overflow).toBe('hidden')
      })
    )
  })
  // TODO: more render prop tests!

  // describe('Dialog.Overlay', () => {
  //   it(
  //     'should be possible to render Dialog.Overlay using a render prop',
  //     suppressConsoleLogs(async () => {
  //       let overlay = jest.fn().mockReturnValue(null)
  //       function Example() {
  //         let [isOpen, setIsOpen] = useState(false)
  //         return (
  //           <>
  //             <button id="trigger" onClick={() => setIsOpen(v => !v)}>
  //               Trigger
  //             </button>
  //             <Dialog open={isOpen} onClose={setIsOpen}>
  //               <Dialog.Overlay>{overlay}</Dialog.Overlay>
  //               <TabSentinel />
  //             </Dialog>
  //           </>
  //         )
  //       }

  //       render(<Example />)

  //       assertDialogOverlay({
  //         state: DialogState.InvisibleUnmounted,
  //         attributes: { id: 'headlessui-dialog-overlay-2' },
  //       })

  //       await click(document.getElementById('trigger'))

  //       assertDialogOverlay({
  //         state: DialogState.Visible,
  //         attributes: { id: 'headlessui-dialog-overlay-2' },
  //       })
  //       expect(overlay).toHaveBeenCalledWith({ open: true })
  //     })
  //   )
  // })

  // describe('Dialog.Title', () => {
  //     it(
  //       'should be possible to render Dialog.Title using a render prop',
  //       suppressConsoleLogs(async () => {
  //         render(
  //           <Dialog open={true} onClose={console.log}>
  //             <Dialog.Title>{JSON.stringify}</Dialog.Title>
  //             <TabSentinel />
  //           </Dialog>
  //         )

  //         assertDialog({
  //           state: DialogState.Visible,
  //           attributes: { id: 'headlessui-dialog-1' },
  //         })
  //         assertDialogTitle({
  //           state: DialogState.Visible,
  //           textContent: JSON.stringify({ open: true }),
  //         })
  //       })
  //     )
  //   })

  //   describe('Dialog.Description', () => {
  //     it(
  //       'should be possible to render Dialog.Description using a render prop',
  //       suppressConsoleLogs(async () => {
  //         render(
  //           <Dialog open={true} onClose={console.log}>
  //             <Dialog.Description>{JSON.stringify}</Dialog.Description>
  //             <TabSentinel />
  //           </Dialog>
  //         )

  //         assertDialog({
  //           state: DialogState.Visible,
  //           attributes: { id: 'headlessui-dialog-1' },
  //         })
  //         assertDialogDescription({
  //           state: DialogState.Visible,
  //           textContent: JSON.stringify({ open: true }),
  //         })
  //       })
  //     )
  //   })
})

describe('Composition', () => {
  it(
    'should be possible to open the Dialog via a Transition component',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          Transition, { show: true }, [
            Dialog, { onClose: console.log }, [
              [DialogDescription, {}, "Description"],
              [TestTabSentinel]
            ]
          ]
        ]
      })

      assertDialog({ state: DialogState.Visible })
      assertDialogDescription({
        state: DialogState.Visible,
        textContent: "Description",
      })
    })
  )

  it(
    'should be possible to close the Dialog via a Transition component',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          Transition, { show: false }, [
            Dialog, { onClose: console.log }, [
              [DialogDescription, {}, "Description"],
              [TestTabSentinel]
            ]
          ]
        ]
      })

      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Escape` key', () => {
    it(
      'should be possible to close the dialog with Escape',
      async () => {
        render(
          TestRenderer, {
          allProps: [
            [ManagedDialog, { buttonText: "Trigger", buttonProps: { id: "trigger" } }, [
              "Contents",
              [TestTabSentinel],
            ]],
          ]
        })

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById("trigger"))

        // Verify it is open
        assertDialog({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-1' },
        })

        // Close dialog
        await press(Keys.Escape)

        // Verify it is close
        assertDialog({ state: DialogState.InvisibleUnmounted })
      }
    )

    it(
      'should be possible to close the dialog with Escape, when a field is focused',
      suppressConsoleLogs(async () => {
        render(
          TestRenderer, {
          allProps: [
            [ManagedDialog, { buttonText: "Trigger", buttonProps: { id: "trigger" } }, [
              "Contents",
              [Input, { id: "name" }],
              [TestTabSentinel],
            ]],
          ]
        })

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById('trigger'))

        // Verify it is open
        assertDialog({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-1' },
        })

        // Close dialog
        await press(Keys.Escape)

        // Verify it is close
        assertDialog({ state: DialogState.InvisibleUnmounted })
      })
    )

    it(
      'should not be possible to close the dialog with Escape, when a field is focused but cancels the event',
      async () => {
        render(
          TestRenderer, {
          allProps: [
            [ManagedDialog, { buttonText: "Trigger", buttonProps: { id: "trigger" } }, [
              "Contents",
              [Input, { id: "name", onKeydown: (e: CustomEvent) => { e.preventDefault(); e.stopPropagation(); } }],
              [TestTabSentinel],
            ]],
          ]
        })

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById('trigger'))

        // Verify it is open
        assertDialog({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-1' },
        })

        // Try to close the dialog
        await press(Keys.Escape)

        // Verify it is still open
        assertDialog({ state: DialogState.Visible })
      })
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to close a Dialog using a click on the Dialog.Overlay',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [ManagedDialog, { buttonText: "Trigger", buttonProps: { id: "trigger" } }, [
            [DialogOverlay],
            "Contents",
            [TestTabSentinel],
          ]],
        ]
      })

      // Open dialog
      await click(document.getElementById('trigger'))

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click to close
      await click(getDialogOverlay())

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )

  it(
    'should not close the Dialog when clicking on contents of the Dialog.Overlay',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [ManagedDialog, { buttonText: "Trigger", buttonProps: { id: "trigger" } }, [
            [DialogOverlay, {}, [
              [Button, {}, "hi"]
            ]],
            "Contents",
            [TestTabSentinel],
          ]],
        ]
      })

      // Open dialog
      await click(document.getElementById('trigger'))

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click on an element inside the overlay
      await click(getByText('hi'))

      // Verify it is still open
      assertDialog({ state: DialogState.Visible })
    })
  )

  it(
    'should be possible to close the dialog, and re-focus the button when we click outside on the body element',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [ManagedDialog, { buttonText: "Trigger", buttonProps: { id: "trigger" } }, [
            "Contents",
            [TestTabSentinel],
          ]],
        ]
      })

      // Open dialog
      await click(getByText('Trigger'))

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the body to close
      await click(document.body)

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getByText('Trigger'))
    })
  )

  it(
    'should be possible to close the dialog, and keep focus on the focusable element',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          [Button, {}, "Hello"],
          [ManagedDialog, { buttonText: "Trigger", buttonProps: { id: "trigger" } }, [
            "Contents",
            [TestTabSentinel],
          ]],
        ]
      })

      // Open dialog
      await click(getByText('Trigger'))

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the button to close (outside click)
      await click(getByText('Hello'))

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getByText('Hello'))
    })
  )

  it(
    'should stop propagating click events when clicking on the Dialog.Overlay',
    suppressConsoleLogs(async () => {
      let wrapperFn = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [Div, { onClick: wrapperFn }, [
            [ManagedDialog, { initialOpen: true }, [
              "Contents",
              [DialogOverlay],
              [TestTabSentinel],
            ]],
          ]]
        ]
      })

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)

      // Click the Dialog.Overlay to close the Dialog
      await click(getDialogOverlay())

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)
    })
  )

  it(
    'should be possible to submit a form inside a Dialog',
    suppressConsoleLogs(async () => {
      let submitFn = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [ManagedDialog, { initialOpen: true }, [
            [Form, { onSubmit: submitFn }, [
              [Input, { type: "hidden", value: "abc" }],
              [Button, { type: "submit" }, "Submit"]
            ]],
            [TestTabSentinel],
          ]],
        ]
      })

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Submit the form
      await click(getByText('Submit'))

      // Verify that the submitFn function has been called
      expect(submitFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should stop propagating click events when clicking on an element inside the Dialog',
    suppressConsoleLogs(async () => {
      let wrapperFn = jest.fn()
      render(
        TestRenderer, {
        allProps: [
          [Div, { onClick: wrapperFn }, [
            [ManagedDialog, { initialOpen: true, buttonInside: true, buttonText: "Inside" }, [
              "Contents",
              [TestTabSentinel],
            ]],
          ]]
        ]
      })

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)

      // Click the button inside the the Dialog
      await click(getByText('Inside'))

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)
    })
  )
})

describe('Nesting', () => {
  it.each`
    strategy                            | action
    ${'with `Escape`'}                  | ${() => press(Keys.Escape)}
    ${'with `Outside Click`'}           | ${() => click(document.body)}
    ${'with `Click on Dialog.Overlay`'} | ${() => click(getDialogOverlays().pop()!)}
  `(
    'should be possible to open nested Dialog components and close them $strategy',
    async ({ action }) => {
      render(NestedTestComponent)

      // Verify we have no open dialogs
      expect(getDialogs()).toHaveLength(0)

      // Open Dialog 1
      await click(getByText('Open 1'))

      // Verify that we have 1 open dialog
      expect(getDialogs()).toHaveLength(1)

      // Verify that the `Open 2 a` has focus
      assertActiveElement(getByText('Open 2 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 a'))

      // Open Dialog 2 via the second button
      await click(getByText('Open 2 b'))

      // Verify that we have 2 open dialogs
      expect(getDialogs()).toHaveLength(2)

      // Verify that the `Open 3 a` has focus
      assertActiveElement(getByText('Open 3 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 a'))

      // Close the top most Dialog
      await action()

      // Verify that we have 1 open dialog
      expect(getDialogs()).toHaveLength(1)

      // Verify that the `Open 2 b` button got focused again
      assertActiveElement(getByText('Open 2 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 b'))

      // Open Dialog 2 via button b
      await click(getByText('Open 2 b'))

      // Verify that the `Open 3 a` has focus
      assertActiveElement(getByText('Open 3 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 a'))

      // Verify that we have 2 open dialogs
      expect(getDialogs()).toHaveLength(2)

      // Open Dialog 3 via button c
      await click(getByText('Open 3 c'))

      // Verify that the `Open 4 a` has focus
      assertActiveElement(getByText('Open 4 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 4 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 4 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 4 a'))

      // Verify that we have 3 open dialogs
      expect(getDialogs()).toHaveLength(3)

      // Close the top most Dialog
      await action()

      // Verify that the `Open 3 c` button got focused again
      assertActiveElement(getByText('Open 3 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 c'))

      // Verify that we have 2 open dialogs
      expect(getDialogs()).toHaveLength(2)

      // Close the top most Dialog
      await action()

      // Verify that we have 1 open dialog
      expect(getDialogs()).toHaveLength(1)

      // Verify that the `Open 2 b` button got focused again
      assertActiveElement(getByText('Open 2 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 b'))

      // Close the top most Dialog
      await action()

      // Verify that we have 0 open dialogs
      expect(getDialogs()).toHaveLength(0)

      // Verify that the `Open 1` button got focused again
      assertActiveElement(getByText('Open 1'))
    }
  )
})

