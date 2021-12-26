import { Dialog, DialogDescription, DialogOverlay, DialogTitle } from "."
import TestTabSentinel from "./_TestTabSentinel.svelte";
import ManagedDialog from "./_ManagedDialog.svelte";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import { render } from "@testing-library/svelte";
import TestRenderer from "$lib/test-utils/TestRenderer.svelte";
import Button from "$lib/internal/elements/Button.svelte";
import P from "$lib/internal/elements/P.svelte";
import Input from "$lib/internal/elements/Input.svelte";
import { assertDialog, assertDialogDescription, DialogState, getDialog } from "$lib/test-utils/accessibility-assertions";
import { click, Keys, press } from "$lib/test-utils/interactions";
import Transition from "$lib/components/transitions/TransitionRoot.svelte";
import { tick } from "svelte";

jest.mock('../../hooks/use-id')

// @ts-expect-error
global.IntersectionObserver = class FakeIntersectionObserver {
  observe() { }
  disconnect() { }
}

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

      assertDialog({
        state: DialogState.InvisibleUnmounted,
        attributes: { id: 'headlessui-dialog-1' },
      })
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


