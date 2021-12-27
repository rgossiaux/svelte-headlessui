import { Disclosure, DisclosureButton, DisclosurePanel } from ".";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import { render } from "@testing-library/svelte";
import TestRenderer from "$lib/test-utils/TestRenderer.svelte";
import { assertDisclosureButton, assertDisclosurePanel, DisclosureState, getDisclosureButton, getDisclosurePanel } from "$lib/test-utils/accessibility-assertions";
import { click } from "$lib/test-utils/interactions";
import { Transition, TransitionChild } from "../transitions";
import TransitionDebug from "./_TransitionDebug.svelte";

let id = 0;
jest.mock('../../hooks/use-id', () => {
  return {
    useId: jest.fn(() => ++id),
  }
})


beforeEach(() => id = 0)
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
    ['DisclosureButton', DisclosureButton],
    ['DisclosurePanel', DisclosurePanel],
  ])(
    'should error when we are using a <%s /> without a parent <Disclosure />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Disclosure /> component.`
      )
    })
  )

  it(
    'should be possible to render a Disclosure without crashing',
    suppressConsoleLogs(async () => {
      render(
        TestRenderer, {
        allProps: [
          Disclosure,
          {},
          [
            [DisclosureButton, {}, "Trigger"],
            [DisclosurePanel, {}, "Contents"],
          ]
        ]
      })

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  // describe('Disclosure', () => {
  //   it(
  //     'should be possible to render a Disclosure using a render prop',
  //     suppressConsoleLogs(async () => {
  //       render(
  //         <Disclosure>
  //           {({ open }) => (
  //             <>
  //               <DisclosureButton>Trigger</DisclosureButton>
  //               <DisclosurePanel>Panel is: {open ? 'open' : 'closed'}</DisclosurePanel>
  //             </>
  //           )}
  //         </Disclosure>
  //       )

  //       assertDisclosureButton({
  //         state: DisclosureState.InvisibleUnmounted,
  //         attributes: { id: 'headlessui-disclosure-button-1' },
  //       })
  //       assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

  //       await click(getDisclosureButton())

  //       assertDisclosureButton({
  //         state: DisclosureState.Visible,
  //         attributes: { id: 'headlessui-disclosure-button-1' },
  //       })
  //       assertDisclosurePanel({ state: DisclosureState.Visible, textContent: 'Panel is: open' })
  //     })
  //   )

  //   it('should be possible to render a Disclosure in an open state by default', async () => {
  //     render(
  //       <Disclosure defaultOpen>
  //         {({ open }) => (
  //           <>
  //             <DisclosureButton>Trigger</DisclosureButton>
  //             <DisclosurePanel>Panel is: {open ? 'open' : 'closed'}</DisclosurePanel>
  //           </>
  //         )}
  //       </Disclosure>
  //     )

  //     assertDisclosureButton({
  //       state: DisclosureState.Visible,
  //       attributes: { id: 'headlessui-disclosure-button-1' },
  //     })
  //     assertDisclosurePanel({ state: DisclosureState.Visible, textContent: 'Panel is: open' })

  //     await click(getDisclosureButton())

  //     assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
  //   })

  //   it(
  //     'should expose a close function that closes the disclosure',
  //     suppressConsoleLogs(async () => {
  //       render(
  //         <Disclosure>
  //           {({ close }) => (
  //             <>
  //               <DisclosureButton>Trigger</DisclosureButton>
  //               <DisclosurePanel>
  //                 <button onClick={() => close()}>Close me</button>
  //               </DisclosurePanel>
  //             </>
  //           )}
  //         </Disclosure>
  //       )

  //       // Focus the button
  //       getDisclosureButton()?.focus()

  //       // Ensure the button is focused
  //       assertActiveElement(getDisclosureButton())

  //       // Open the disclosure
  //       await click(getDisclosureButton())

  //       // Ensure we can click the close button
  //       await click(getByText('Close me'))

  //       // Ensure the disclosure is closed
  //       assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

  //       // Ensure the DisclosureButton got the restored focus
  //       assertActiveElement(getByText('Trigger'))
  //     })
  //   )

  //   it(
  //     'should expose a close function that closes the disclosure and restores to a specific element',
  //     suppressConsoleLogs(async () => {
  //       render(
  //         <>
  //           <button id="test">restoreable</button>
  //           <Disclosure>
  //             {({ close }) => (
  //               <>
  //                 <DisclosureButton>Trigger</DisclosureButton>
  //                 <DisclosurePanel>
  //                   <button onClick={() => close(document.getElementById('test')!)}>
  //                     Close me
  //                   </button>
  //                 </DisclosurePanel>
  //               </>
  //             )}
  //           </Disclosure>
  //         </>
  //       )

  //       // Focus the button
  //       getDisclosureButton()?.focus()

  //       // Ensure the button is focused
  //       assertActiveElement(getDisclosureButton())

  //       // Open the disclosure
  //       await click(getDisclosureButton())

  //       // Ensure we can click the close button
  //       await click(getByText('Close me'))

  //       // Ensure the disclosure is closed
  //       assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

  //       // Ensure the restoreable button got the restored focus
  //       assertActiveElement(getByText('restoreable'))
  //     })
  //   )

  //   it(
  //     'should expose a close function that closes the disclosure and restores to a ref',
  //     suppressConsoleLogs(async () => {
  //       function Example() {
  //         let elementRef = useRef(null)
  //         return (
  //           <>
  //             <button ref={elementRef}>restoreable</button>
  //             <Disclosure>
  //               {({ close }) => (
  //                 <>
  //                   <DisclosureButton>Trigger</DisclosureButton>
  //                   <DisclosurePanel>
  //                     <button onClick={() => close(elementRef)}>Close me</button>
  //                   </DisclosurePanel>
  //                 </>
  //               )}
  //             </Disclosure>
  //           </>
  //         )
  //       }

  //       render(<Example />)

  //       // Focus the button
  //       getDisclosureButton()?.focus()

  //       // Ensure the button is focused
  //       assertActiveElement(getDisclosureButton())

  //       // Open the disclosure
  //       await click(getDisclosureButton())

  //       // Ensure we can click the close button
  //       await click(getByText('Close me'))

  //       // Ensure the disclosure is closed
  //       assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

  //       // Ensure the restoreable button got the restored focus
  //       assertActiveElement(getByText('restoreable'))
  //     })
  //   )
  // })

  describe('DisclosureButton', () => {
    // it(
    //   'should be possible to render a DisclosureButton using a render prop',
    //   suppressConsoleLogs(async () => {
    //     render(
    //       <Disclosure>
    //         <DisclosureButton>{JSON.stringify}</DisclosureButton>
    //         <DisclosurePanel></DisclosurePanel>
    //       </Disclosure>
    //     )

    //     assertDisclosureButton({
    //       state: DisclosureState.InvisibleUnmounted,
    //       attributes: { id: 'headlessui-disclosure-button-1' },
    //       textContent: JSON.stringify({ open: false }),
    //     })
    //     assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

    //     await click(getDisclosureButton())

    //     assertDisclosureButton({
    //       state: DisclosureState.Visible,
    //       attributes: { id: 'headlessui-disclosure-button-1' },
    //       textContent: JSON.stringify({ open: true }),
    //     })
    //     assertDisclosurePanel({ state: DisclosureState.Visible })
    //   })
    // )

    // it(
    //   'should be possible to render a DisclosureButton using a render prop and an `as` prop',
    //   suppressConsoleLogs(async () => {
    //     render(
    //       <Disclosure>
    //         <DisclosureButton as="div" role="button">
    //           {JSON.stringify}
    //         </DisclosureButton>
    //         <DisclosurePanel />
    //       </Disclosure>
    //     )

    //     assertDisclosureButton({
    //       state: DisclosureState.InvisibleUnmounted,
    //       attributes: { id: 'headlessui-disclosure-button-1' },
    //       textContent: JSON.stringify({ open: false }),
    //     })
    //     assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

    //     await click(getDisclosureButton())

    //     assertDisclosureButton({
    //       state: DisclosureState.Visible,
    //       attributes: { id: 'headlessui-disclosure-button-1' },
    //       textContent: JSON.stringify({ open: true }),
    //     })
    //     assertDisclosurePanel({ state: DisclosureState.Visible })
    //   })
    // )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(
          TestRenderer, {
          allProps: [
            Disclosure, {},
            [
              [DisclosureButton, {}, "Trigger"]
            ]
          ]
        })

        expect(getDisclosureButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          TestRenderer, {
          allProps: [
            Disclosure, {},
            [
              [DisclosureButton, { type: "submit" }, "Trigger"]
            ]
          ]
        })

        expect(getDisclosureButton()).toHaveAttribute('type', 'submit')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(
          TestRenderer, {
          allProps: [
            Disclosure, {},
            [
              [DisclosureButton, { as: "div" }, "Trigger"]
            ]
          ]
        })

        expect(getDisclosureButton()).not.toHaveAttribute('type')
      })

    })
  })

  describe('DisclosurePanel', () => {
    // it(
    //   'should be possible to render DisclosurePanel using a render prop',
    //   suppressConsoleLogs(async () => {
    //     render(
    //       <Disclosure>
    //         <DisclosureButton>Trigger</DisclosureButton>
    //         <DisclosurePanel>{JSON.stringify}</DisclosurePanel>
    //       </Disclosure>
    //     )

    //     assertDisclosureButton({
    //       state: DisclosureState.InvisibleUnmounted,
    //       attributes: { id: 'headlessui-disclosure-button-1' },
    //     })
    //     assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

    //     await click(getDisclosureButton())

    //     assertDisclosureButton({
    //       state: DisclosureState.Visible,
    //       attributes: { id: 'headlessui-disclosure-button-1' },
    //     })
    //     assertDisclosurePanel({
    //       state: DisclosureState.Visible,
    //       textContent: JSON.stringify({ open: true }),
    //     })
    //   })
    // )

    it('should be possible to always render the DisclosurePanel if we provide it a `static` prop', () => {
      render(
        TestRenderer, {
        allProps: [
          Disclosure, {},
          [
            [DisclosureButton, {}, "Trigger"],
            [DisclosurePanel, { static: true }, "Contents"]
          ]
        ]
      })

      // Let's verify that the Disclosure is already there
      expect(getDisclosurePanel()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the DisclosurePanel', async () => {
      render(
        TestRenderer, {
        allProps: [
          Disclosure, {},
          [
            [DisclosureButton, {}, "Trigger"],
            [DisclosurePanel, { unmount: false }, "Contents"]
          ]
        ]
      })

      assertDisclosureButton({ state: DisclosureState.InvisibleHidden })
      assertDisclosurePanel({ state: DisclosureState.InvisibleHidden })

      // Let's open the Disclosure, to see if it is not hidden anymore
      await click(getDisclosureButton())

      assertDisclosureButton({ state: DisclosureState.Visible })
      assertDisclosurePanel({ state: DisclosureState.Visible })

      // Let's re-click the Disclosure, to see if it is hidden again
      await click(getDisclosureButton())

      assertDisclosureButton({ state: DisclosureState.InvisibleHidden })
      assertDisclosurePanel({ state: DisclosureState.InvisibleHidden })
    })

    // it(
    //   'should expose a close function that closes the disclosure',
    //   suppressConsoleLogs(async () => {
    //     render(
    //       <Disclosure>
    //         <DisclosureButton>Trigger</DisclosureButton>
    //         <DisclosurePanel>
    //           {({ close }) => <button onClick={() => close()}>Close me</button>}
    //         </DisclosurePanel>
    //       </Disclosure>
    //     )

    //     // Focus the button
    //     getDisclosureButton()?.focus()

    //     // Ensure the button is focused
    //     assertActiveElement(getDisclosureButton())

    //     // Open the disclosure
    //     await click(getDisclosureButton())

    //     // Ensure we can click the close button
    //     await click(getByText('Close me'))

    //     // Ensure the disclosure is closed
    //     assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

    //     // Ensure the DisclosureButton got the restored focus
    //     assertActiveElement(getByText('Trigger'))
    //   })
    // )

    // it(
    //   'should expose a close function that closes the disclosure and restores to a specific element',
    //   suppressConsoleLogs(async () => {
    //     render(
    //       <>
    //         <button id="test">restoreable</button>
    //         <Disclosure>
    //           <DisclosureButton>Trigger</DisclosureButton>
    //           <DisclosurePanel>
    //             {({ close }) => (
    //               <button onClick={() => close(document.getElementById('test')!)}>Close me</button>
    //             )}
    //           </DisclosurePanel>
    //         </Disclosure>
    //       </>
    //     )

    //     // Focus the button
    //     getDisclosureButton()?.focus()

    //     // Ensure the button is focused
    //     assertActiveElement(getDisclosureButton())

    //     // Open the disclosure
    //     await click(getDisclosureButton())

    //     // Ensure we can click the close button
    //     await click(getByText('Close me'))

    //     // Ensure the disclosure is closed
    //     assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

    //     // Ensure the restoreable button got the restored focus
    //     assertActiveElement(getByText('restoreable'))
    //   })
    // )

    // it(
    //   'should expose a close function that closes the disclosure and restores to a ref',
    //   suppressConsoleLogs(async () => {
    //     function Example() {
    //       let elementRef = useRef(null)
    //       return (
    //         <>
    //           <button ref={elementRef}>restoreable</button>
    //           <Disclosure>
    //             <DisclosureButton>Trigger</DisclosureButton>
    //             <DisclosurePanel>
    //               {({ close }) => <button onClick={() => close(elementRef)}>Close me</button>}
    //             </DisclosurePanel>
    //           </Disclosure>
    //         </>
    //       )
    //     }

    //     render(<Example />)

    //     // Focus the button
    //     getDisclosureButton()?.focus()

    //     // Ensure the button is focused
    //     assertActiveElement(getDisclosureButton())

    //     // Open the disclosure
    //     await click(getDisclosureButton())

    //     // Ensure we can click the close button
    //     await click(getByText('Close me'))

    //     // Ensure the disclosure is closed
    //     assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

    //     // Ensure the restoreable button got the restored focus
    //     assertActiveElement(getByText('restoreable'))
    //   })
    // )
  })
})

describe('Composition', () => {
  it(
    'should be possible to control the DisclosurePanel by wrapping it in a Transition component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      // render(
      //   <Disclosure>
      //     <Disclosure.Button>Trigger</Disclosure.Button>
      //     <Debug name="Disclosure" fn={orderFn} />
      //     <Transition>
      //       <Debug name="Transition" fn={orderFn} />
      //       <Disclosure.Panel>
      //         <Transition.Child>
      //           <Debug name="Transition.Child" fn={orderFn} />
      //         </Transition.Child>
      //       </Disclosure.Panel>
      //     </Transition>
      //   </Disclosure>
      // )
      render(
        TestRenderer, {
        allProps: [
          Disclosure, {}, [
            [DisclosureButton, {}, "Trigger"],
            [TransitionDebug, { name: "Disclosure", fn: orderFn }],
            [Transition, {}, [
              [TransitionDebug, { name: "Transition", fn: orderFn }],
              [DisclosurePanel, {}, [
                [TransitionChild, {}, [
                  [TransitionDebug, { name: "TransitionChild", fn: orderFn }],
                ]]
              ]]
            ]]
          ]
        ]
      })

      // Verify the Disclosure is hidden
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Open the Disclosure component
      await click(getDisclosureButton())

      // Verify the Disclosure is visible
      assertDisclosurePanel({ state: DisclosureState.Visible })

      // Unmount the full tree
      await click(getDisclosureButton())

      // Wait for all transitions to finish
      await nextFrame()

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      // Note that with Svelte the components are unmounted top-down instead of bottom-up as with React
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Disclosure'],
        ['Mounting - Transition'],
        ['Mounting - TransitionChild'],
        ['Unmounting - Transition'],
        ['Unmounting - TransitionChild'],
      ])
    })
  )
})
