import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from ".";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import { act, render } from "@testing-library/svelte";
import {
  assertActiveElement,
  assertActiveListboxOption,
  assertListbox,
  assertListboxButton,
  assertListboxButtonLinkedWithListbox,
  assertListboxButtonLinkedWithListboxLabel,
  assertListboxLabel,
  assertListboxLabelLinkedWithListbox,
  assertListboxOption,
  assertNoActiveListboxOption,
  assertNoSelectedListboxOption,
  getByText,
  getListbox,
  getListboxButton,
  getListboxButtons,
  getListboxes,
  getListboxLabel,
  getListboxOptions,
  ListboxState,
} from "$lib/test-utils/accessibility-assertions";
import {
  click,
  focus,
  Keys,
  MouseButton,
  mouseLeave,
  mouseMove,
  press,
  shift,
  type,
  word,
} from "$lib/test-utils/interactions";
import { Transition } from "../transitions";
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

describe('safeguards', () => {
  it.each([
    ['ListboxButton', ListboxButton],
    ['ListboxLabel', ListboxLabel],
    ['ListboxOptions', ListboxOptions],
    ['ListboxOption', ListboxOption],
  ])(
    'should error when we are using a <%s /> without a parent <Listbox />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Listbox /> component.`
      )
    })
  )

  it(
    'should be possible to render a Listbox without crashing',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Listbox', () => {
    it(
      'should render a Listbox using slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log} let:open>
            <ListboxButton>Trigger</ListboxButton>
            {#if open}
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            {/if}
          </Listbox>
        `)

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )

    it(
      'should be possible to disable a Listbox',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log} disabled>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await press(Keys.Enter, getListboxButton())

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
      })
    )
  })

  describe('ListboxLabel', () => {
    it(
      'should be possible to render a ListboxLabel using slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxLabel let:open let:disabled>{JSON.stringify({ open, disabled })}</ListboxLabel>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a"> Option A </ListboxOption>
              <ListboxOption value="b"> Option B </ListboxOption>
              <ListboxOption value="c"> Option C </ListboxOption>
            </ListboxOptions>
          </Listbox>
        `)

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertListbox({ state: ListboxState.Visible })
        assertListboxLabelLinkedWithListbox()
        assertListboxButtonLinkedWithListboxLabel()
      })
    )

    it(
      'should be possible to render a ListboxLabel with slot props and an `as` prop',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxLabel as="p" let:open let:disabled>{JSON.stringify({ open, disabled })}</ListboxLabel>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `)

        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
          tag: 'p',
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())
        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
          tag: 'p',
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )
  });

  describe("ListboxButton", () => {
    it(
      'should render a ListboxButton with slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton let:open let:disabled>{JSON.stringify({ open, disabled})}</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A </ListboxOption>
              <ListboxOption value="b">Option B </ListboxOption>
              <ListboxOption value="c">Option C </ListboxOption>
            </ListboxOptions>
          </Listbox>
        `)

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )

    it(
      'should be possible to render a ListboxButton using slot props and an `as` prop',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton as="div" role="button" let:open let:disabled>
              {JSON.stringify({ open, disabled })}
            </ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `)

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )

    it(
      'should be possible to render a ListboxButton and a ListboxLabel and see them linked together',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxLabel>Label</ListboxLabel>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // TODO: Needed to make it similar to vue test implementation?
        // await new Promise(requestAnimationFrame)

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
        assertListboxButtonLinkedWithListboxLabel()
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(svelte`
          <Listbox value={null} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
          </Listbox>
        `);

        expect(getListboxButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(svelte`
          <Listbox value={null} on:change={console.log}>
            <ListboxButton type="submit">Trigger</ListboxButton>
          </Listbox>
        `);

        expect(getListboxButton()).toHaveAttribute('type', 'submit')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(svelte`
          <Listbox value={null} on:change={console.log}>
            <ListboxButton as="div">Trigger</ListboxButton>
          </Listbox>
        `);

        expect(getListboxButton()).not.toHaveAttribute('type')
      })

    })
  })

  describe('ListboxOptions', () => {
    it(
      'should render ListboxOptions with slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions let:open>
              <ListboxOption value="a">{JSON.stringify({ open })}</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `)

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({
          state: ListboxState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
        assertActiveElement(getListbox())
      })
    )

    it('should be possible to always render the ListboxOptions if we provide it a `static` prop', () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions static>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Let's verify that the Listbox is already there
      expect(getListbox()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the ListboxOptions', async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions unmount={false}>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      assertListbox({ state: ListboxState.InvisibleHidden })

      // Let's open the Listbox, to see if it is not hidden anymore
      await click(getListboxButton())

      assertListbox({ state: ListboxState.Visible })
    })
  })

  describe('ListboxOption', () => {
    it(
      'should render a ListboxOption with slot props',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" let:active let:selected let:disabled>
                {JSON.stringify({ active, selected, disabled })}
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
        `)

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({
          state: ListboxState.Visible,
          textContent: JSON.stringify({ active: false, selected: false, disabled: false }),
        })
      })
    )

    it('should guarantee the listbox option order after a few unmounts', async () => {
      let showFirst = writable(false);
      render(svelte`
      <Listbox value={undefined}>
        <ListboxButton>Trigger</ListboxButton>
        <ListboxOptions>
          {#if $showFirst}
            <ListboxOption value="a">Option A</ListboxOption>
          {/if}
          <ListboxOption value="b">Option B</ListboxOption>
          <ListboxOption value="c">Option C</ListboxOption>
        </ListboxOptions>
      </Listbox>
    `)

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open Listbox
      await click(getListboxButton())

      let options = getListboxOptions()
      expect(options).toHaveLength(2)
      options.forEach(option => assertListboxOption(option))

      // Make the first option active
      await press(Keys.ArrowDown)

      // Verify that the first listbox option is active
      assertActiveListboxOption(options[0])

      // Now add a new option dynamically
      await act(() => showFirst.set(true));

      // New option should be treated correctly
      options = getListboxOptions()
      expect(options).toHaveLength(3)
      options.forEach(option => assertListboxOption(option))

      // Focused option should now be second
      assertActiveListboxOption(options[1])

      // We should be able to go to the first option
      await press(Keys.Home)
      assertActiveListboxOption(options[0])

      // And the last one
      await press(Keys.End)
      assertActiveListboxOption(options[2])

    })
  })
})

describe('Rendering composition', () => {
  it(
    'should be possible to conditionally render classNames (aka class can be a function?!)',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a" class={(bag) => JSON.stringify(bag)}>Option A</ListboxOption>
            <ListboxOption value="b" class={(bag) => JSON.stringify(bag)} disabled>Option B</ListboxOption>
            <ListboxOption value="c" class="no-special-treatment">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open Listbox
      await click(getListboxButton())

      let options = getListboxOptions()

      // Verify correct classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that nothing is active
      assertNoActiveListboxOption(getListbox())

      // Make the first option active
      await press(Keys.ArrowDown)

      // Verify the classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: true, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that the first option is the active one
      assertActiveListboxOption(options[0])

      // Let's go down, this should go to the third option since the second option is disabled!
      await press(Keys.ArrowDown)

      // Verify the classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that the last option is the active one
      assertActiveListboxOption(options[2])
    })
  )

  it(
    'should be possible to swap the Listbox option with a button for example',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a" as="button">Option A</ListboxOption>
            <ListboxOption value="b" as="button">Option B</ListboxOption>
            <ListboxOption value="c" as="button">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open Listbox
      await click(getListboxButton())

      // Verify options are buttons now
      getListboxOptions().forEach(option => assertListboxOption(option, { tag: 'button' }))
    })
  )
})


describe('Composition', () => {
  it(
    'should be possible to wrap the ListboxOptions with a Transition component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <TransitionDebug name="Listbox" fn={orderFn} />
          <Transition>
            <TransitionDebug name="Transition" fn={orderFn} />
            <ListboxOptions>
              <ListboxOption as="button" value="a">
                <TransitionDebug name="ListboxOption" fn={orderFn} />
                Option A
              </ListboxOption>
            </ListboxOptions>
          </Transition>
        </Listbox>
      `);

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      await click(getListboxButton())

      assertListboxButton({
        state: ListboxState.Visible,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({
        state: ListboxState.Visible,
        textContent: "Option A",
      })

      await click(getListboxButton())

      // Wait for all transitions to finish
      await nextFrame()

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Listbox'],
        ['Mounting - Transition'],
        ['Mounting - ListboxOption'],
        ['Unmounting - Transition'],
        ['Unmounting - ListboxOption'],
      ])
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the listbox with Enter',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option, { selected: false }))

        // Verify that the first listbox option is active
        assertActiveListboxOption(options[0])
        assertNoSelectedListboxOption()
      })
    )

    it(
      'should not be possible to open the listbox with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log} disabled>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Try to open the listbox
        await press(Keys.Enter)

        // Verify it is still closed
        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the listbox with Enter, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value="b" on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to open the listbox with Enter, and focus the selected option (when using the `hidden` render strategy)',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value="b" on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions unmount={false}>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleHidden,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleHidden })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        let options = getListboxOptions()

        // Hover over Option A
        await mouseMove(options[0])

        // Verify that Option A is active
        assertActiveListboxOption(options[0])

        // Verify that Option B is still selected
        assertListboxOption(options[1], { selected: true })

        // Close/Hide the listbox
        await press(Keys.Escape)

        // Re-open the listbox
        await click(getListboxButton())

        // Verify we have listbox options
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to open the listbox with Enter, and focus the selected option (with a list of objects)',
      suppressConsoleLogs(async () => {
        let myOptions = [
          { id: 'a', name: 'Option A' },
          { id: 'b', name: 'Option B' },
          { id: 'c', name: 'Option C' },
        ]
        render(svelte`
          <Listbox value={myOptions[1]} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value={myOptions[0]}>Option A</ListboxOption>
              <ListboxOption value={myOptions[1]}>Option B</ListboxOption>
              <ListboxOption value={myOptions[2]}>Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should have no active listbox option when there are no listbox options at all',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions />
          </Listbox>
        `);

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Enter',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Enter (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should have no active listbox option upon Enter key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to close the listbox with Enter when there is no active listboxoption',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Open listbox
        await click(getListboxButton())

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })

        // Close listbox
        await press(Keys.Enter)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.InvisibleUnmounted })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getListboxButton())
      })
    )

    it(
      'should be possible to close the listbox with Enter and choose the active listbox option',
      suppressConsoleLogs(async () => {
        let handleChange = jest.fn()
        let value = writable();
        render(svelte`
          <Listbox value={$value} on:change={(e) => { value.set(e.detail); handleChange(e.detail) } }>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Open listbox
        await click(getListboxButton())

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })

        // Activate the first listbox option
        let options = getListboxOptions()
        await mouseMove(options[0])

        // Choose option, and close listbox
        await press(Keys.Enter)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.InvisibleUnmounted })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('a')

        // Verify the button is focused again
        assertActiveElement(getListboxButton())

        // Open listbox again
        await click(getListboxButton())

        // Verify the active option is the previously selected one
        assertActiveListboxOption(getListboxOptions()[0])
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the listbox with Space',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should not be possible to open the listbox with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log} disabled>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Try to open the listbox
        await press(Keys.Space)

        // Verify it is still closed
        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the listbox with Space, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value="b" on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should have no active listbox option when there are no listbox options at all',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions />
          </Listbox>
        `);

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Space',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        let options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Space (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        let options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should have no active listbox option upon Space key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to close the listbox with Space and choose the active listbox option',
      suppressConsoleLogs(async () => {
        let handleChange = jest.fn()
        let value = writable();
        render(svelte`
          <Listbox value={$value} on:change={(e) => { value.set(e.detail); handleChange(e.detail) } }>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);


        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Open listbox
        await click(getListboxButton())

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })

        // Activate the first listbox option
        let options = getListboxOptions()
        await mouseMove(options[0])

        // Choose option, and close listbox
        await press(Keys.Space)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.InvisibleUnmounted })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('a')

        // Verify the button is focused again
        assertActiveElement(getListboxButton())

        // Open listbox again
        await click(getListboxButton())

        // Verify the active option is the previously selected one
        assertActiveListboxOption(getListboxOptions()[0])
      })
    )
  })

  describe('`Escape` key', () => {
    it(
      'should be possible to close an open listbox with Escape',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Close listbox
        await press(Keys.Escape)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.InvisibleUnmounted })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getListboxButton())
      })
    )
  })

  describe('`Tab` key', () => {
    it(
      'should focus trap when we use Tab',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])

        // Try to tab
        await press(Keys.Tab)

        // Verify it is still open
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())
      })
    )

    it(
      'should focus trap when we use Shift+Tab',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])

        // Try to Shift+Tab
        await press(shift(Keys.Tab))

        // Verify it is still open
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())
      })
    )
  })

  describe('`ArrowDown` key', () => {
    it(
      'should be possible to open the listbox with ArrowDown',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);
        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowDown)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))

        // Verify that the first listbox option is active
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should not be possible to open the listbox with ArrowDown when the button is disabled',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log} disabled>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Try to open the listbox
        await press(Keys.ArrowDown)

        // Verify it is still closed
        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the listbox with ArrowDown, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value="b" on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowDown)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should have no active listbox option when there are no listbox options at all',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions />
          </Listbox>
        `);

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowDown)
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the listbox options',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);
        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])

        // We should be able to go down once
        await press(Keys.ArrowDown)
        assertActiveListboxOption(options[1])

        // We should be able to go down again
        await press(Keys.ArrowDown)
        assertActiveListboxOption(options[2])

        // We should NOT be able to go down again (because last option). Current implementation won't go around.
        await press(Keys.ArrowDown)
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the listbox options and skip the first disabled one',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[1])

        // We should be able to go down once
        await press(Keys.ArrowDown)
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the listbox options and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[2])
      })
    )
  })

  describe('`ArrowRight` key', () => {
    it(
      'should be possible to use ArrowRight to navigate the listbox options',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log} horizontal>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])

        // We should be able to go right once
        await press(Keys.ArrowRight)
        assertActiveListboxOption(options[1])

        // We should be able to go right again
        await press(Keys.ArrowRight)
        assertActiveListboxOption(options[2])

        // We should NOT be able to go right again (because last option). Current implementation won't go around.
        await press(Keys.ArrowRight)
        assertActiveListboxOption(options[2])
      })
    )
  })

  describe('`ArrowUp` key', () => {
    it(
      'should be possible to open the listbox with ArrowUp and the last option should be active',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))

        // ! ALERT: The LAST option should now be active
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should not be possible to open the listbox with ArrowUp and the last option should be active when the button is disabled',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log} disabled>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Try to open the listbox
        await press(Keys.ArrowUp)

        // Verify it is still closed
        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the listbox with ArrowUp, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value="b" on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should have no active listbox option when there are no listbox options at all',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions />
          </Listbox>
        `);

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the listbox options and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should not be possible to navigate up or down if there is only a single non-disabled option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[2])

        // We should not be able to go up (because those are disabled)
        await press(Keys.ArrowUp)
        assertActiveListboxOption(options[2])

        // We should not be able to go down (because this is the last option)
        await press(Keys.ArrowDown)
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the listbox options',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[2])

        // We should be able to go down once
        await press(Keys.ArrowUp)
        assertActiveListboxOption(options[1])

        // We should be able to go down again
        await press(Keys.ArrowUp)
        assertActiveListboxOption(options[0])

        // We should NOT be able to go up again (because first option). Current implementation won't go around.
        await press(Keys.ArrowUp)
        assertActiveListboxOption(options[0])
      })
    )
  })

  describe('`ArrowLeft` key', () => {
    it(
      'should be possible to use ArrowLeft to navigate the listbox options',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log} horizontal>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
          orientation: 'horizontal',
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[2])

        // We should be able to go left once
        await press(Keys.ArrowLeft)
        assertActiveListboxOption(options[1])

        // We should be able to go left again
        await press(Keys.ArrowLeft)
        assertActiveListboxOption(options[0])

        // We should NOT be able to go left again (because first option). Current implementation won't go around.
        await press(Keys.ArrowLeft)
        assertActiveListboxOption(options[0])
      })
    )
  })

  describe('`End` key', () => {
    it(
      'should be possible to use the End key to go to the last listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

        // We should be on the first option
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await press(Keys.End)
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the End key to go to the last non disabled listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
              <ListboxOption value="d" disabled>Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

        // We should be on the first option
        assertActiveListboxOption(options[0])

        // We should be able to go to the last non-disabled option
        await press(Keys.End)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to use the End key to go to the first listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
              <ListboxOption value="d" disabled>Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.End)

        let options = getListboxOptions()
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should have no active listbox option upon End key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
              <ListboxOption value="d" disabled>Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.End)

        assertNoActiveListboxOption()
      })
    )
  })

  describe('`PageDown` key', () => {
    it(
      'should be possible to use the PageDown key to go to the last listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

        // We should be on the first option
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await press(Keys.PageDown)
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the PageDown key to go to the last non disabled listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
              <ListboxOption value="d" disabled>Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

        // We should be on the first option
        assertActiveListboxOption(options[0])

        // We should be able to go to the last non-disabled option
        await press(Keys.PageDown)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to use the PageDown key to go to the first listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
              <ListboxOption value="d" disabled>Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.PageDown)

        let options = getListboxOptions()
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should have no active listbox option upon PageDown key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
              <ListboxOption value="d" disabled>Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.PageDown)

        assertNoActiveListboxOption()
      })
    )
  })

  describe('`Home` key', () => {
    it(
      'should be possible to use the Home key to go to the first listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should be able to go to the first option
        await press(Keys.Home)
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should be possible to use the Home key to go to the first non disabled listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
              <ListboxOption value="d">Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.Home)

        let options = getListboxOptions()

        // We should be on the first non-disabled option
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the Home key to go to the last listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
              <ListboxOption value="d">Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.Home)

        let options = getListboxOptions()
        assertActiveListboxOption(options[3])
      })
    )

    it(
      'should have no active listbox option upon Home key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
              <ListboxOption value="d" disabled>Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.Home)

        assertNoActiveListboxOption()
      })
    )
  })

  describe('`PageUp` key', () => {
    it(
      'should be possible to use the PageUp key to go to the first listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should be able to go to the first option
        await press(Keys.PageUp)
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should be possible to use the PageUp key to go to the first non disabled listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
              <ListboxOption value="d">Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        let options = getListboxOptions()

        // We should be on the first non-disabled option
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the PageUp key to go to the last listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
              <ListboxOption value="d">Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        let options = getListboxOptions()
        assertActiveListboxOption(options[3])
      })
    )

    it(
      'should have no active listbox option upon PageUp key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" disabled>Option A</ListboxOption>
              <ListboxOption value="b" disabled>Option B</ListboxOption>
              <ListboxOption value="c" disabled>Option C</ListboxOption>
              <ListboxOption value="d" disabled>Option D</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        assertNoActiveListboxOption()
      })
    )
  })

  describe('`Any` key aka search', () => {
    it(
      'should be possible to type a full word that has a perfect match',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Open listbox
        await click(getListboxButton())

        let options = getListboxOptions()

        // We should be able to go to the second option
        await type(word('bob'))
        assertActiveListboxOption(options[1])

        // We should be able to go to the first option
        await type(word('alice'))
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await type(word('charlie'))
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to type a partial of a word',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should be able to go to the second option
        await type(word('bo'))
        assertActiveListboxOption(options[1])

        // We should be able to go to the first option
        await type(word('ali'))
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await type(word('char'))
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to type words with spaces',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">value a</ListboxOption>
              <ListboxOption value="b">value b</ListboxOption>
              <ListboxOption value="c">value c</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should be able to go to the second option
        await type(word('value b'))
        assertActiveListboxOption(options[1])

        // We should be able to go to the first option
        await type(word('value a'))
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await type(word('value c'))
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should not be possible to search for a disabled option',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob" disabled>bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should not be able to go to the disabled option
        await type(word('bo'))

        // We should still be on the last option
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to search for a word (case insensitive)',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `);

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // Search for bob in a different casing
        await type(word('BO'))

        // We should be on `bob`
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to search for the next occurence',
      suppressConsoleLogs(async () => {
        render(svelte`
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">alice</ListboxOption>
              <ListboxOption value="b">bob</ListboxOption>
              <ListboxOption value="c">charlie</ListboxOption>
              <ListboxOption value="d">bob</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `)

        // Open listbox
        await click(getListboxButton())

        let options = getListboxOptions()

        // Search for bob
        await type(word('b'))

        // We should be on the first `bob`
        assertActiveListboxOption(options[1])

        // Search for bob again
        await type(word('b'))

        // We should be on the second `bob`
        assertActiveListboxOption(options[3])

        // Search for bob once again
        await type(word('b'))

        // We should be back on the first `bob`
        assertActiveListboxOption(options[1])
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should focus the ListboxButton when we click the ListboxLabel',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxLabel>Label</ListboxLabel>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Ensure the button is not focused yet
      assertActiveElement(document.body)

      // Focus the label
      await click(getListboxLabel())

      // Ensure that the actual button is focused instead
      assertActiveElement(getListboxButton())
    })
  )

  it(
    'should not focus the ListboxButton when we right click the ListboxLabel',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxLabel>Label</ListboxLabel>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Ensure the button is not focused yet
      assertActiveElement(document.body)

      // Focus the label
      await click(getListboxLabel(), MouseButton.Right)

      // Ensure that the body is still active
      assertActiveElement(document.body)
    })
  )

  it(
    'should be possible to open the listbox on click',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open listbox
      await click(getListboxButton())

      // Verify it is visible
      assertListboxButton({ state: ListboxState.Visible })
      assertListbox({
        state: ListboxState.Visible,
        attributes: { id: 'headlessui-listbox-options-2' },
      })
      assertActiveElement(getListbox())
      assertListboxButtonLinkedWithListbox()

      // Verify we have listbox options
      let options = getListboxOptions()
      expect(options).toHaveLength(3)
      options.forEach(option => assertListboxOption(option))
    })
  )

  it(
    'should not be possible to open the listbox on right click',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Try to open the listbox
      await click(getListboxButton(), MouseButton.Right)

      // Verify it is still closed
      assertListboxButton({ state: ListboxState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open the listbox on click when the button is disabled',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log} disabled>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Try to open the listbox
      await click(getListboxButton())

      // Verify it is still closed
      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to open the listbox on click, and focus the selected option',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value="b" on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open listbox
      await click(getListboxButton())

      // Verify it is visible
      assertListboxButton({ state: ListboxState.Visible })
      assertListbox({
        state: ListboxState.Visible,
        attributes: { id: 'headlessui-listbox-options-2' },
      })
      assertActiveElement(getListbox())
      assertListboxButtonLinkedWithListbox()

      // Verify we have listbox options
      let options = getListboxOptions()
      expect(options).toHaveLength(3)
      options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

      // Verify that the second listbox option is active (because it is already selected)
      assertActiveListboxOption(options[1])
    })
  )

  it(
    'should be possible to close a listbox on click',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())

      // Verify it is visible
      assertListboxButton({ state: ListboxState.Visible })

      // Click to close
      await click(getListboxButton())

      // Verify it is closed
      assertListboxButton({ state: ListboxState.InvisibleUnmounted })
      assertListbox({ state: ListboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be a no-op when we click outside of a closed listbox',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Verify that the window is closed
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Click something that is not related to the listbox
      await click(document.body)

      // Should still be closed
      assertListbox({ state: ListboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to click outside of the listbox which should close the listbox',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      // Click something that is not related to the listbox
      await click(document.body)

      // Should be closed now
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getListboxButton())
    })
  )

  it(
    'should be possible to click outside of the listbox on another listbox button which should close the current listbox and open the new listbox',
    suppressConsoleLogs(async () => {
      render(svelte`
        <div>
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        </div>
        `)

      let [button1, button2] = getListboxButtons()

      // Click the first listbox button
      await click(button1)
      expect(getListboxes()).toHaveLength(1) // Only 1 listbox should be visible

      // Ensure the open listbox is linked to the first button
      assertListboxButtonLinkedWithListbox(button1, getListbox())

      // Click the second listbox button
      await click(button2)

      expect(getListboxes()).toHaveLength(1) // Only 1 listbox should be visible

      // Ensure the open listbox is linked to the second button
      assertListboxButtonLinkedWithListbox(button2, getListbox())
    })
  )

  it(
    'should be possible to click outside of the listbox which should close the listbox (even if we press the listbox button)',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      // Click the listbox button again
      await click(getListboxButton())

      // Should be closed now
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getListboxButton())
    })
  )

  // TODO: This test looks like it's for React-specific behavior (for some reason)
  it.skip(
    'should be possible to click outside of the listbox, on an element which is within a focusable element, which closes the listbox',
    suppressConsoleLogs(async () => {
      let focusFn = jest.fn()
      render(svelte`
        <div>
          <Listbox value={undefined} on:change={console.log}>
            <ListboxButton on:focus={focusFn}>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
          <button id="btn">
            <span>Next</span>
          </button>
        </div>
        `)

      // Click the listbox button
      await click(getListboxButton())

      // Ensure the listbox is open
      assertListbox({ state: ListboxState.Visible })

      // Click the span inside the button
      await click(getByText('Next'))

      // Ensure the listbox is closed
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Ensure the outside button is focused
      assertActiveElement(document.getElementById('btn'))

      // Ensure that the focus button only got focus once (first click)
      expect(focusFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should be possible to hover an option and make it active',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())

      let options = getListboxOptions()
      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveListboxOption(options[1])

      // We should be able to go to the first option
      await mouseMove(options[0])
      assertActiveListboxOption(options[0])

      // We should be able to go to the last option
      await mouseMove(options[2])
      assertActiveListboxOption(options[2])
    })
  )

  it(
    'should make a listbox option active when you move the mouse over it',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())

      let options = getListboxOptions()
      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveListboxOption(options[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the listbox option is already active',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())

      let options = getListboxOptions()

      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveListboxOption(options[1])

      await mouseMove(options[1])

      // Nothing should be changed
      assertActiveListboxOption(options[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the listbox option is disabled',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b" disabled>Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())

      let options = getListboxOptions()

      await mouseMove(options[1])
      assertNoActiveListboxOption()
    })
  )

  it(
    'should not be possible to hover an option that is disabled',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b" disabled>Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())

      let options = getListboxOptions()

      // Try to hover over option 1, which is disabled
      await mouseMove(options[1])

      // We should not have an active option now
      assertNoActiveListboxOption()
    })
  )

  it(
    'should be possible to mouse leave an option and make it inactive',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())

      let options = getListboxOptions()

      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveListboxOption(options[1])

      await mouseLeave(options[1])
      assertNoActiveListboxOption()

      // We should be able to go to the first option
      await mouseMove(options[0])
      assertActiveListboxOption(options[0])

      await mouseLeave(options[0])
      assertNoActiveListboxOption()

      // We should be able to go to the last option
      await mouseMove(options[2])
      assertActiveListboxOption(options[2])

      await mouseLeave(options[2])
      assertNoActiveListboxOption()
    })
  )

  it(
    'should be possible to mouse leave a disabled option and be a no-op',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b" disabled>Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())

      let options = getListboxOptions()

      // Try to hover over option 1, which is disabled
      await mouseMove(options[1])
      assertNoActiveListboxOption()

      await mouseLeave(options[1])
      assertNoActiveListboxOption()
    })
  )

  it(
    'should be possible to click a listbox option, which closes the listbox',
    suppressConsoleLogs(async () => {
      let handleChange = jest.fn()
      let value = writable();
      render(svelte`
        <Listbox value={$value} on:change={(e) => { value.set(e.detail); handleChange(e.detail) } }>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      let options = getListboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertListbox({ state: ListboxState.InvisibleUnmounted })
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith('b')

      // Verify the button is focused again
      assertActiveElement(getListboxButton())

      // Open listbox again
      await click(getListboxButton())

      // Verify the active option is the previously selected one
      assertActiveListboxOption(getListboxOptions()[1])
    })
  )

  it(
    'should be possible to click a disabled listbox option, which is a no-op',
    suppressConsoleLogs(async () => {
      let handleChange = jest.fn()
      let value = writable();
      render(svelte`
        <Listbox value={$value} on:change={(e) => { value.set(e.detail); handleChange(e.detail) } }>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b" disabled>Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);


      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      let options = getListboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())
      expect(handleChange).toHaveBeenCalledTimes(0)

      // Close the listbox
      await click(getListboxButton())

      // Open listbox again
      await click(getListboxButton())

      // Verify the active option is non existing
      assertNoActiveListboxOption()
    })
  )

  it(
    'should be possible focus a listbox option, so that it becomes active',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      let options = getListboxOptions()

      // Verify that nothing is active yet
      assertNoActiveListboxOption()

      // We should be able to focus the first option
      await focus(options[1])
      assertActiveListboxOption(options[1])
    })
  )

  it(
    'should not be possible to focus a listbox option which is disabled',
    suppressConsoleLogs(async () => {
      render(svelte`
        <Listbox value={undefined} on:change={console.log}>
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b" disabled>Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `);

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      let options = getListboxOptions()

      // We should not be able to focus the first option
      await focus(options[1])
      assertNoActiveListboxOption()
    })
  )
})
