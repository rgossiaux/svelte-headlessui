import {
  assertActiveElement,
  assertFocusable,
  assertNotFocusable,
  assertRadioGroupLabel,
  getByText,
  getRadioGroupOptions,
} from "$lib/test-utils/accessibility-assertions";
import { render } from "@testing-library/svelte";
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from ".";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import { click, Keys, press, shift } from "$lib/test-utils/interactions";
import svelte from "svelte-inline-compile";
import { get, writable } from "svelte/store";

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

describe('Safe guards', () => {
  it.each([['RadioGroupOption', RadioGroupOption]])(
    'should error when we are using a <%s /> without a parent <RadioGroup />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <RadioGroup /> component.`
      )
    })
  )

  it(
    'should be possible to render a RadioGroup without crashing',
    suppressConsoleLogs(async () => {
      render(svelte`
        <RadioGroup value={undefined}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
      `);

      assertRadioGroupLabel({ textContent: 'Pizza Delivery' })
    })
  )

  it('should be possible to render a RadioGroup without options and without crashing', () => {
    render(RadioGroup, { value: undefined })
  })
})

describe('Rendering', () => {
  it('should be possible to render a RadioGroup, where the first element is tabbable (value is undefined)', async () => {
    render(svelte`
      <RadioGroup value={undefined}>
        <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
        <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
        <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
        <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
      </RadioGroup>
    `);

    expect(getRadioGroupOptions()).toHaveLength(3)

    assertFocusable(getByText('Pickup'))
    assertNotFocusable(getByText('Home delivery'))
    assertNotFocusable(getByText('Dine in'))
  })

  it('should be possible to render a RadioGroup, where the first element is tabbable (value is null)', async () => {
    render(svelte`
      <RadioGroup value={null}>
        <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
        <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
        <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
        <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
      </RadioGroup>
    `);

    expect(getRadioGroupOptions()).toHaveLength(3)

    assertFocusable(getByText('Pickup'))
    assertNotFocusable(getByText('Home delivery'))
    assertNotFocusable(getByText('Dine in'))
  })

  it('should be possible to render a RadioGroup with an active value', async () => {
    render(svelte`
      <RadioGroup value={"home-delivery"}>
        <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
        <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
        <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
        <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
      </RadioGroup>
    `);

    expect(getRadioGroupOptions()).toHaveLength(3)

    assertNotFocusable(getByText('Pickup'))
    assertFocusable(getByText('Home delivery'))
    assertNotFocusable(getByText('Dine in'))
  })

  it('should guarantee the radio option order after a few unmounts', async () => {
    render(svelte`
      <script>
        let showFirst = false;
        let value = null;
      </script>
      <button on:click={() => showFirst = !showFirst}>Toggle</button>
      <RadioGroup bind:value>
        <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
        {#if showFirst}
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
        {/if}
        <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
        <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
      </RadioGroup>
    `)

    await click(getByText('Toggle')) // Render the pickup again

    await press(Keys.Tab) // Focus first element
    assertActiveElement(getByText('Pickup'))

    await press(Keys.ArrowUp) // Loop around
    assertActiveElement(getByText('Dine in'))

    await press(Keys.ArrowUp) // Up again
    assertActiveElement(getByText('Home delivery'))
  })

  it('should be possible to disable a RadioGroup', async () => {
    let value = writable(null);

    render(svelte`
      <script>
        let disabled = true;
      </script>
      <button on:click={() => disabled = !disabled}>Toggle</button>
      <RadioGroup bind:value={$value} {disabled}>
        <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
        <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
        <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
        <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        <RadioGroupOption value="slot-prop" data-value="slot-prop" let:checked let:disabled let:active>
          {JSON.stringify({ checked, disabled, active })}
        </RadioGroupOption>
      </RadioGroup>
    `)


    // Try to click on a few options
    await click(getByText('Pickup'))
    await click(getByText('Dine in'))

    // Verify that the RadioGroupOption gets the disabled state
    expect(document.querySelector('[data-value="slot-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: true,
        active: false,
      })
    )

    // Make sure that the value has not changed
    expect(get(value)).toBeNull();

    // Make sure that all the options get an `aria-disabled`
    let options = getRadioGroupOptions()
    expect(options).toHaveLength(4)
    for (let option of options) expect(option).toHaveAttribute('aria-disabled', 'true')

    // Toggle the disabled state
    await click(getByText('Toggle'))

    // Verify that the RadioGroupOption gets the disabled state
    expect(document.querySelector('[data-value="slot-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: false,
        active: false,
      })
    )

    // Try to click one a few options
    await click(getByText('Pickup'))

    // Make sure that the value changed
    expect(get(value)).toEqual("pickup");
  })

  it('should be possible to disable a RadioGroupOption', async () => {
    let value = writable(null);

    render(svelte`
      <script>
        let disabled = true;
      </script>
      <button on:click={() => disabled = !disabled}>Toggle</button>
      <RadioGroup bind:value={$value}>
        <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
        <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
        <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
        <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        <RadioGroupOption value="slot-prop" {disabled} data-value="slot-prop" let:checked let:disabled let:active>
          {JSON.stringify({ checked, disabled, active })}
        </RadioGroupOption>
      </RadioGroup>
    `)

    // Try to click the disabled option
    await click(document.querySelector('[data-value="slot-prop"]'))

    // Verify that the RadioGroupOption gets the disabled state
    expect(document.querySelector('[data-value="slot-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: true,
        active: false,
      })
    )

    // Make sure that the value has not changed
    expect(get(value)).toBeNull();

    // Make sure that the option with value "slot-prop" gets an `aria-disabled`
    let options = getRadioGroupOptions()
    expect(options).toHaveLength(4)
    for (let option of options) {
      if (option.dataset.value) {
        expect(option).toHaveAttribute('aria-disabled', 'true')
      } else {
        expect(option).not.toHaveAttribute('aria-disabled')
      }
    }

    // Toggle the disabled state
    await click(getByText('Toggle'))

    // Verify that the RadioGroupOption gets the disabled state
    expect(document.querySelector('[data-value="slot-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: false,
        active: false,
      })
    )

    // Try to click one a few options
    await click(document.querySelector('[data-value="slot-prop"]'))

    // Make sure that the value changed
    expect(get(value)).toEqual("slot-prop");
  })

})

describe('Keyboard interactions', () => {
  describe('`Tab` key', () => {
    it('should be possible to tab to the first item', async () => {
      render(svelte`
        <RadioGroup value={undefined}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
      `);

      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))
    })

    it('should not change the selected element on focus', async () => {
      let changeFn = jest.fn()
      let value = writable(null);
      value.subscribe(changeFn);

      render(svelte`
        <RadioGroup bind:value={$value}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
      `);

      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      // 1 for initial subscription
      expect(changeFn).toHaveBeenCalledTimes(1)
    })

    it('should be possible to tab to the active item', async () => {
      render(svelte`
        <RadioGroup value={"home-delivery"}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
      `);

      await press(Keys.Tab)

      assertActiveElement(getByText('Home delivery'))
    })

    it('should not change the selected element on focus (when selecting the active item)', async () => {
      let changeFn = jest.fn()
      let value = writable("home-delivery");
      value.subscribe(changeFn);

      render(svelte`
        <RadioGroup bind:value={$value}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
      `);

      await press(Keys.Tab)

      assertActiveElement(getByText('Home delivery'))

      // 1 for initial subscription
      expect(changeFn).toHaveBeenCalledTimes(1)
    })

    it('should be possible to tab out of the radio group (no selected value)', async () => {
      render(svelte`
        <button>Before</button>
        <RadioGroup value={undefined}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);

      await press(Keys.Tab)
      assertActiveElement(getByText('Before'))

      await press(Keys.Tab)
      assertActiveElement(getByText('Pickup'))

      await press(Keys.Tab)
      assertActiveElement(getByText('After'))
    })

    it('should be possible to tab out of the radio group (selected value)', async () => {
      render(svelte`
        <button>Before</button>
        <RadioGroup value={"home-delivery"}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      await press(Keys.Tab)
      assertActiveElement(getByText('Before'))

      await press(Keys.Tab)
      assertActiveElement(getByText('Home delivery'))

      await press(Keys.Tab)
      assertActiveElement(getByText('After'))
    })
  })

  describe('`Shift+Tab` key', () => {
    it('should be possible to tab to the first item', async () => {
      render(svelte`
        <RadioGroup value={undefined}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Pickup'))
    })

    it('should not change the selected element on focus', async () => {
      let changeFn = jest.fn()
      let value = writable(null);
      value.subscribe(changeFn);

      render(svelte`
        <RadioGroup bind:value={$value}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Pickup'))

      // 1 for initial subscription
      expect(changeFn).toHaveBeenCalledTimes(1)
    })

    it('should be possible to tab to the active item', async () => {
      render(svelte`
        <RadioGroup value={"home-delivery"}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Home delivery'))
    })

    it('should not change the selected element on focus (when selecting the active item)', async () => {
      let changeFn = jest.fn()
      let value = writable("home-delivery");
      value.subscribe(changeFn);

      render(svelte`
        <RadioGroup bind:value={$value}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);

      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Home delivery'))

      // 1 for initial subscription
      expect(changeFn).toHaveBeenCalledTimes(1)
    })

    it('should be possible to tab out of the radio group (no selected value)', async () => {
      render(svelte`
        <button>Before</button>
        <RadioGroup value={undefined}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      getByText('After')?.focus()

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Pickup'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Before'))
    })

    it('should be possible to tab out of the radio group (selected value)', async () => {
      render(svelte`
        <button>Before</button>
        <RadioGroup value={"home-delivery"}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      getByText('After')?.focus()

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Home delivery'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Before'))
    })
  })

  describe('`ArrowLeft` key', () => {
    it('should go to the previous item when pressing the ArrowLeft key', async () => {
      let changeFn = jest.fn()
      let value = writable(null);
      value.subscribe(changeFn);
      render(svelte`
        <button>Before</button>
        <RadioGroup bind:value={$value}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowLeft) // Loop around
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowLeft)
      assertActiveElement(getByText('Home delivery'))

      // 1 for initial subscription
      expect(changeFn).toHaveBeenCalledTimes(3)
      expect(changeFn).toHaveBeenNthCalledWith(2, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(3, 'home-delivery')
    })
  })

  describe('`ArrowUp` key', () => {
    it('should go to the previous item when pressing the ArrowUp key', async () => {
      let changeFn = jest.fn()
      let value = writable(null);
      value.subscribe(changeFn);
      render(svelte`
        <button>Before</button>
        <RadioGroup bind:value={$value}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowUp) // Loop around
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowUp)
      assertActiveElement(getByText('Home delivery'))

      // 1 for initial subscription
      expect(changeFn).toHaveBeenCalledTimes(3)
      expect(changeFn).toHaveBeenNthCalledWith(2, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(3, 'home-delivery')
    })
  })

  describe('`ArrowRight` key', () => {
    it('should go to the next item when pressing the ArrowRight key', async () => {
      let changeFn = jest.fn()
      let value = writable(null);
      value.subscribe(changeFn);
      render(svelte`
        <button>Before</button>
        <RadioGroup bind:value={$value}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowRight)
      assertActiveElement(getByText('Home delivery'))

      await press(Keys.ArrowRight)
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowRight) // Loop around
      assertActiveElement(getByText('Pickup'))

      // 1 for initial subscription
      expect(changeFn).toHaveBeenCalledTimes(4)
      expect(changeFn).toHaveBeenNthCalledWith(2, 'home-delivery')
      expect(changeFn).toHaveBeenNthCalledWith(3, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(4, 'pickup')
    })
  })

  describe('`ArrowDown` key', () => {
    it('should go to the next item when pressing the ArrowDown key', async () => {
      let changeFn = jest.fn()
      let value = writable(null);
      value.subscribe(changeFn);
      render(svelte`
        <button>Before</button>
        <RadioGroup bind:value={$value}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowDown)
      assertActiveElement(getByText('Home delivery'))

      await press(Keys.ArrowDown)
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowDown) // Loop around
      assertActiveElement(getByText('Pickup'))

      // 1 for initial subscription
      expect(changeFn).toHaveBeenCalledTimes(4)
      expect(changeFn).toHaveBeenNthCalledWith(2, 'home-delivery')
      expect(changeFn).toHaveBeenNthCalledWith(3, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(4, 'pickup')
    })
  })

  describe('`Space` key', () => {
    it('should select the current option when pressing space', async () => {
      let changeFn = jest.fn()
      let value = writable(null);
      value.subscribe(changeFn);

      render(svelte`
        <button>Before</button>
        <RadioGroup bind:value={$value}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);


      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.Space)
      assertActiveElement(getByText('Pickup'))

      // 1 for initial subscription
      expect(changeFn).toHaveBeenCalledTimes(2)
      expect(changeFn).toHaveBeenNthCalledWith(2, 'pickup')
    })

    it('should select the current option only once when pressing space', async () => {
      let changeFn = jest.fn()
      let value = writable(null);
      value.subscribe(changeFn);

      render(svelte`
        <button>Before</button>
        <RadioGroup bind:value={$value}>
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `);

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.Space)
      await press(Keys.Space)
      await press(Keys.Space)
      await press(Keys.Space)
      await press(Keys.Space)
      assertActiveElement(getByText('Pickup'))

      // 1 for initial subscription
      expect(changeFn).toHaveBeenCalledTimes(2)
      expect(changeFn).toHaveBeenNthCalledWith(2, 'pickup')
    })
  })
})

describe('Mouse interactions', () => {
  it('should be possible to change the current radio group value when clicking on a radio option', async () => {
    let changeFn = jest.fn()
    let value = writable(null);
    value.subscribe(changeFn);

    render(svelte`
      <button>Before</button>
      <RadioGroup bind:value={$value}>
        <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
        <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
        <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
        <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
      </RadioGroup>
      <button>After</button>
    `);

    await click(getByText('Home delivery'))

    assertActiveElement(getByText('Home delivery'))

    expect(changeFn).toHaveBeenNthCalledWith(2, 'home-delivery')
  })

  it('should be a no-op when clicking on the same item', async () => {
    let changeFn = jest.fn()
    let value = writable(null);
    value.subscribe(changeFn);

    render(svelte`
      <button>Before</button>
      <RadioGroup bind:value={$value}>
        <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
        <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
        <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
        <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
      </RadioGroup>
      <button>After</button>
    `);

    await click(getByText('Home delivery'))
    await click(getByText('Home delivery'))
    await click(getByText('Home delivery'))
    await click(getByText('Home delivery'))

    assertActiveElement(getByText('Home delivery'))

    // 1 for initial subscription
    expect(changeFn).toHaveBeenCalledTimes(2)
  })
})
