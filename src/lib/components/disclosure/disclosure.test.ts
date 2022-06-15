import { Disclosure, DisclosureButton, DisclosurePanel } from ".";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import { render } from "@testing-library/svelte";
import {
  assertActiveElement,
  assertDisclosureButton,
  assertDisclosurePanel,
  DisclosureState,
  getByText,
  getDisclosureButton,
  getDisclosurePanel,
} from "$lib/test-utils/accessibility-assertions";
import { click, Keys, MouseButton, press } from "$lib/test-utils/interactions";
import { Transition, TransitionChild } from "../transitions";
import TransitionDebug from "./_TransitionDebug.svelte";
import svelte from "svelte-inline-compile";

let mockId = 0;
jest.mock("../../hooks/use-id", () => {
  return {
    useId: jest.fn(() => ++mockId),
  };
});

beforeEach(() => (mockId = 0));
afterAll(() => jest.restoreAllMocks());

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

describe("Safe guards", () => {
  it.each([
    ["DisclosureButton", DisclosureButton],
    ["DisclosurePanel", DisclosurePanel],
  ])(
    "should error when we are using a <%s /> without a parent <Disclosure />",
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Disclosure /> component.`
      );
    })
  );

  it(
    "should be possible to render a Disclosure without crashing",
    suppressConsoleLogs(async () => {
      render(svelte`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>Contents</DisclosurePanel>
        </Disclosure>
      `);

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: "headlessui-disclosure-button-1" },
      });
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted });
    })
  );
});

describe("Rendering", () => {
  describe('Disclosure', () => {
    it(
      'should render a Disclosure with slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure let:open>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Panel is: {open ? 'open' : 'closed'}</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.Visible, textContent: 'Panel is: open' })
      })
    )

    it('should be possible to render a Disclosure in an open state by default', async () => {
      render(svelte`
        <Disclosure defaultOpen let:open>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>Panel is: {open ? 'open' : 'closed'}</DisclosurePanel>
        </Disclosure>
      `)

      assertDisclosureButton({
        state: DisclosureState.Visible,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.Visible, textContent: 'Panel is: open' })

      await click(getDisclosureButton())

      assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
    })

    it(
      'should expose a close function that closes the disclosure',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure let:close>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>
              <button on:click={() => close()}>Close me</button>
            </DisclosurePanel>
          </Disclosure>
        `)

        // Focus the button
        getDisclosureButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getDisclosureButton())

        // Open the disclosure
        await click(getDisclosureButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the disclosure is closed
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Ensure the DisclosureButton got the restored focus
        assertActiveElement(getByText('Trigger'))
      })
    )

    it(
      'should expose a close function that closes the disclosure and restores to a specific element',
      suppressConsoleLogs(async () => {
        render(svelte`
          <button id="test">restoreable</button>
          <Disclosure let:close>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>
              <button on:click={() => close(document.getElementById('test'))}>
                Close me
              </button>
            </DisclosurePanel>
          </Disclosure>
        `)

        // Focus the button
        getDisclosureButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getDisclosureButton())

        // Open the disclosure
        await click(getDisclosureButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the disclosure is closed
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )
  })

  describe("DisclosureButton", () => {
    it(
      'should render a DisclosureButton with slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure let:open>
            <DisclosureButton>{JSON.stringify({ open })}</DisclosureButton>
            <DisclosurePanel></DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertDisclosurePanel({ state: DisclosureState.Visible })
      })
    )

    it(
      'should be possible to render a DisclosureButton using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton as="div" role="button" let:open>
              {JSON.stringify({ open })}
            </DisclosureButton>
            <DisclosurePanel />
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertDisclosurePanel({ state: DisclosureState.Visible })
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
          </Disclosure>
        `)

        expect(getDisclosureButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton type="submit">Trigger</DisclosureButton>
          </Disclosure>
        `)

        expect(getDisclosureButton()).toHaveAttribute('type', 'submit')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton as="div">Trigger</DisclosureButton>
          </Disclosure>
        `)

        expect(getDisclosureButton()).not.toHaveAttribute('type')
      })

    })
  })

  describe('DisclosurePanel', () => {
    it(
      'should render a DisclosurePanel with slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel let:open>{JSON.stringify({ open })}</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )

    it('should be possible to always render the DisclosurePanel if we provide it a `static` prop', () => {
      render(svelte`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel static>Contents</DisclosurePanel>
        </Disclosure>
      `)

      // Let's verify that the Disclosure is already there
      expect(getDisclosurePanel()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the DisclosurePanel', async () => {
      render(svelte`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel unmount={false}>Contents</DisclosurePanel>
        </Disclosure>
      `)

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

    it(
      'should expose a close function that closes the disclosure',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel let:close>
              <button on:click={() => close()}>Close me</button>
            </DisclosurePanel>
          </Disclosure>
        `)

        // Focus the button
        getDisclosureButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getDisclosureButton())

        // Open the disclosure
        await click(getDisclosureButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the disclosure is closed
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Ensure the DisclosureButton got the restored focus
        assertActiveElement(getByText('Trigger'))
      })
    )

    it(
      'should expose a close function that closes the disclosure and restores to a specific element',
      suppressConsoleLogs(async () => {
        render(svelte`
          <button id="test">restoreable</button>
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel let:close>
                <button on:click={() => close(document.getElementById('test'))}>Close me</button>
            </DisclosurePanel>
          </Disclosure>
        `)

        // Focus the button
        getDisclosureButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getDisclosureButton())

        // Open the disclosure
        await click(getDisclosureButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the disclosure is closed
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )
  })
})

describe('Composition', () => {
  it(
    'should be possible to control the DisclosurePanel by wrapping it in a Transition component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(svelte`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <TransitionDebug name="Disclosure" fn={orderFn} />
          <Transition>
            <TransitionDebug name="Transition" fn={orderFn} />
            <DisclosurePanel>
              <TransitionChild>
                <TransitionDebug name="TransitionChild" fn={orderFn} />
              </TransitionChild>
            </DisclosurePanel>
          </Transition>
        </Disclosure>
      `)

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

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the Disclosure with Enter',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Enter)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })

        // Close disclosure
        await press(Keys.Enter)
        assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
      })
    )

    it(
      'should not be possible to open the disclosure with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton disabled>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Try to open the disclosure
        await press(Keys.Enter)

        // Verify it is still closed
        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the disclosure with Enter when the disclosure is open',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Enter)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })

        // Close disclosure
        await press(Keys.Enter)

        // Verify it is closed again
        assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the disclosure with Space',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Space)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })
      })
    )

    it(
      'should not be possible to open the disclosure with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton disabled>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Try to open the disclosure
        await press(Keys.Space)

        // Verify it is still closed
        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the disclosure with Space when the disclosure is open',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Space)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })

        // Close disclosure
        await press(Keys.Space)

        // Verify it is closed again
        assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to open a disclosure on click',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>Contents</DisclosurePanel>
        </Disclosure>
      `)

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Open disclosure
      await click(getDisclosureButton())

      // Verify it is open
      assertDisclosureButton({ state: DisclosureState.Visible })
      assertDisclosurePanel({
        state: DisclosureState.Visible,
        attributes: { id: 'headlessui-disclosure-panel-2' },
      })
    })
  )

  it(
    'should not be possible to open a disclosure on right click',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>Contents</DisclosurePanel>
        </Disclosure>
      `)

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Open disclosure
      await click(getDisclosureButton(), MouseButton.Right)

      // Verify it is still closed
      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open a disclosure on click when the button is disabled',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Disclosure>
          <DisclosureButton disabled>Trigger</DisclosureButton>
          <DisclosurePanel>Contents</DisclosurePanel>
        </Disclosure>
      `)

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Try to open the disclosure
      await click(getDisclosureButton())

      // Verify it is still closed
      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close a disclosure on click',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>Contents</DisclosurePanel>
        </Disclosure>
      `)

      // Open disclosure
      await click(getDisclosureButton())

      // Verify it is open
      assertDisclosureButton({ state: DisclosureState.Visible })

      // Click to close
      await click(getDisclosureButton())

      // Verify it is closed
      assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close the Disclosure by clicking on a DisclosureButton inside a DisclosurePanel',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>
            <DisclosureButton>Close</DisclosureButton>
          </DisclosurePanel>
        </Disclosure>
      `)

      // Open the disclosure
      await click(getDisclosureButton())

      let closeBtn = getByText('Close')

      expect(closeBtn).not.toHaveAttribute('id')
      expect(closeBtn).not.toHaveAttribute('aria-controls')
      expect(closeBtn).not.toHaveAttribute('aria-expanded')

      // The close button should close the disclosure
      await click(closeBtn)

      // Verify it is closed
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Verify we restored the Open button
      assertActiveElement(getDisclosureButton())
    })
  )
})
