import { act, render } from "@testing-library/svelte";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import TestRenderer from "$lib/test-utils/TestRenderer.svelte";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from ".";
import { assertActiveElement, assertTabs, getByText, getTabs } from "$lib/test-utils/accessibility-assertions";
import { click, Keys, press, shift } from "$lib/test-utils/interactions";
import Button from "$lib/internal/elements/Button.svelte";
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

describe('safeguards', () => {
  it.each([
    ['TabList', TabList],
    ['Tab', Tab],
    ['TabPanels', TabPanels],
    ['TabPanel', TabPanel],
  ])(
    'should error when we are using a <%s /> without a parent <TabGroup /> component',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <TabGroup /> component.`
      )
    })
  )

  it('should be possible to render TabGroup without crashing', async () => {
    render(
      TestRenderer, {
      allProps: [
        [TabGroup, {}, [
          [TabList, {}, [
            [Tab, {}, "Tab 1"],
            [Tab, {}, "Tab 2"],
            [Tab, {}, "Tab 3"],
          ]],
          [TabPanels, {}, [
            [TabPanel, {}, "Content 1"],
            [TabPanel, {}, "Content 2"],
            [TabPanel, {}, "Content 3"],
          ]],
        ]],
      ]
    })

    assertTabs({ active: 0 })
  })
})

describe('Rendering', () => {
  it('should be possible to render the TabPanels first, then the TabList', async () => {
    render(
      TestRenderer, {
      allProps: [
        [TabGroup, {}, [
          [TabPanels, {}, [
            [TabPanel, {}, "Content 1"],
            [TabPanel, {}, "Content 2"],
            [TabPanel, {}, "Content 3"],
          ]],
          [TabList, {}, [
            [Tab, {}, "Tab 1"],
            [Tab, {}, "Tab 2"],
            [Tab, {}, "Tab 3"],
          ]],
        ]],
      ]
    })

    assertTabs({ active: 0 })
  })

  it('should guarantee the order of DOM nodes when performing actions', async () => {
    render(svelte`
      <script>
        let hide = false;
      </script>

      <button on:click={() => hide = !hide}>toggle</button>
      <TabGroup>
        <TabList>
          <Tab>Tab 1</Tab>
          {#if !hide}
            <Tab>Tab 2</Tab>
          {/if}
          <Tab>Tab 3</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>Content 1</TabPanel>
          {#if !hide}
            <TabPanel>Content 2</TabPanel>
          {/if}
          <TabPanel>Content 3</TabPanel>
        </TabPanels>
      </TabGroup>
    `)

    await click(getByText('toggle')) // Remove Tab 2
    await click(getByText('toggle')) // Re-add Tab 2

    await press(Keys.Tab)
    assertTabs({ active: 0 })

    await press(Keys.ArrowRight)
    assertTabs({ active: 1 })

    await press(Keys.ArrowRight)
    assertTabs({ active: 2 })
  })

  describe('`slot props`', () => {
    it('should expose the `selectedIndex` on the `TabGroup` component', async () => {
      render(svelte`
        <TabGroup let:selectedIndex>
          <pre id="exposed">{JSON.stringify({ selectedIndex })}</pre>

          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>Content 1</TabPanel>
            <TabPanel>Content 2</TabPanel>
            <TabPanel>Content 3</TabPanel>
          </TabPanels>
        </TabGroup>
      `)

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selectedIndex` on the `TabList` component', async () => {
      render(svelte`
        <TabGroup>
          <TabList let:selectedIndex>
            <pre id="exposed">{ JSON.stringify({ selectedIndex }) }</pre>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>Content 1</TabPanel>
            <TabPanel>Content 2</TabPanel>
            <TabPanel>Content 3</TabPanel>
          </TabPanels>
        </TabGroup>
      `)

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selectedIndex` on the `TabPanels` component', async () => {
      render(svelte`
        <TabGroup>
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>

          <TabPanels let:selectedIndex>
            <pre id="exposed">{ JSON.stringify({ selectedIndex }) }</pre>
            <TabPanel>Content 1</TabPanel>
            <TabPanel>Content 2</TabPanel>
            <TabPanel>Content 3</TabPanel>
          </TabPanels>
      </TabGroup>
    `)

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selected` state on the `Tab` components', async () => {
      render(svelte`
        <TabGroup>
          <TabList>
            <Tab let:selected>
              <pre data-tab={0}>{JSON.stringify({selected})}</pre>
              <span>Tab 1</span>
            </Tab>
            <Tab let:selected>
              <pre data-tab={1}>{JSON.stringify({selected})}</pre>
              <span>Tab 2</span>
            </Tab>
            <Tab let:selected>
              <pre data-tab={2}>{JSON.stringify({selected})}</pre>
              <span>Tab 3</span>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>Content 1</TabPanel>
            <TabPanel>Content 2</TabPanel>
            <TabPanel>Content 3</TabPanel>
          </TabPanels>
        </TabGroup>
      `)

      expect(document.querySelector('[data-tab="0"]')).toHaveTextContent(
        JSON.stringify({ selected: true })
      )
      expect(document.querySelector('[data-tab="1"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
      expect(document.querySelector('[data-tab="2"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )

      await click(getTabs()[1])

      expect(document.querySelector('[data-tab="0"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
      expect(document.querySelector('[data-tab="1"]')).toHaveTextContent(
        JSON.stringify({ selected: true })
      )
      expect(document.querySelector('[data-tab="2"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
    })

    it('should expose the `selected` state on the `TabPanel` components', async () => {
      render(svelte`
        <TabGroup>
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>

          <TabPanels>
            <TabPanel unmount={false} let:selected>
              <pre data-panel={0}>{JSON.stringify({ selected })}</pre>
              <span> Content 1 </span>
            </TabPanel>
            <TabPanel unmount={false} let:selected>
              <pre data-panel={1}>{JSON.stringify({ selected })}</pre>
              <span> Content 2 </span>
            </TabPanel>
            <TabPanel unmount={false} let:selected>
              <pre data-panel={2}>{JSON.stringify({ selected })}</pre>
              <span> Content 3 </span>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      `)

      expect(document.querySelector('[data-panel="0"]')).toHaveTextContent(
        JSON.stringify({ selected: true })
      )
      expect(document.querySelector('[data-panel="1"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
      expect(document.querySelector('[data-panel="2"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )

      await click(getByText('Tab 2'))

      expect(document.querySelector('[data-panel="0"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
      expect(document.querySelector('[data-panel="1"]')).toHaveTextContent(
        JSON.stringify({ selected: true })
      )
      expect(document.querySelector('[data-panel="2"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
    })
  })

  describe('`defaultIndex`', () => {
    it('should jump to the nearest tab when the defaultIndex is out of bounds (-2)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: -2 }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 0 })
      assertActiveElement(getByText('Tab 1'))
    })

    it('should jump to the nearest tab when the defaultIndex is out of bounds (+5)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 5 }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 2 })
      assertActiveElement(getByText('Tab 3'))
    })

    it('should jump to the next available tab when the defaultIndex is a disabled tab', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 0 }, [
            [TabList, {}, [
              [Tab, { disabled: true }, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 1 })
      assertActiveElement(getByText('Tab 2'))
    })

    it('should jump to the next available tab when the defaultIndex is a disabled tab and wrap around', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 2 }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, { disabled: true }, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 0 })
      assertActiveElement(getByText('Tab 1'))
    })
  })

  describe(`'Tab'`, () => {
    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(
          TestRenderer, {
          allProps: [
            [TabGroup, {}, [
              [TabList, {}, [
                [Tab, {}, "Trigger"],
              ]],
            ]],
          ]
        })

        expect(getTabs()[0]).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          TestRenderer, {
          allProps: [
            [TabGroup, {}, [
              [TabList, {}, [
                [Tab, { type: "submit" }, "Trigger"],
              ]],
            ]],
          ]
        })

        expect(getTabs()[0]).toHaveAttribute('type', 'submit')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(
          TestRenderer, {
          allProps: [
            [TabGroup, {}, [
              [TabList, {}, [
                [Tab, { as: "div" }, "Trigger"],
              ]],
            ]],
          ]
        })

        expect(getTabs()[0]).not.toHaveAttribute('type')
      })

    })

    it('should guarantee the tab order after a few unmounts', async () => {
      let showFirst = writable(false);
      render(svelte`
      <TabGroup>
        <TabList>
          {#if $showFirst}
            <Tab>Tab 1</Tab>
          {/if}
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </TabList>
      </TabGroup>
    `)

      let tabs = getTabs()
      expect(tabs).toHaveLength(2)

      // Make the first tab active
      await press(Keys.Tab)

      // Verify that the first tab is active
      assertTabs({ active: 0 })

      // Now add a new tab dynamically
      await act(() => showFirst.set(true));

      // New tab should be treated correctly
      tabs = getTabs()
      expect(tabs).toHaveLength(3)

      // Active tab should now be second
      assertTabs({ active: 1 })

      // We should be able to go to the first tab
      await press(Keys.Home)
      assertTabs({ active: 0 })

      // And the last one
      await press(Keys.End)
      assertTabs({ active: 2 })
    })
  })
})

describe('Keyboard interactions', () => {
  describe('`Tab` key', () => {
    it('should be possible to tab to the default initial first tab', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, {}, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 0 })
      assertActiveElement(getByText('Tab 1'))

      await press(Keys.Tab)
      assertActiveElement(getByText('Content 1'))

      await press(Keys.Tab)
      assertActiveElement(getByText('after'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Content 1'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Tab 1'))
    })

    it('should be possible to tab to the default index tab', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 1 }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 1 })
      assertActiveElement(getByText('Tab 2'))

      await press(Keys.Tab)
      assertActiveElement(getByText('Content 2'))

      await press(Keys.Tab)
      assertActiveElement(getByText('after'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Content 2'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Tab 2'))
    })
  })

  describe('`ArrowRight` key', () => {
    it('should be possible to go to the next item (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, {}, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 2 })
    })

    it('should be possible to go to the next item (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 0 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 2 })
    })

    it('should wrap around at the end (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, {}, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 2 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })
    })

    it('should wrap around at the end (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 0 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 2 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 2 })
      await press(Keys.Enter)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 0 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })
    })

    it('should not be possible to go right when in vertical mode (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { vertical: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowRight)
      // no-op
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should not be possible to go right when in vertical mode (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { vertical: true, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowRight)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)
      // no-op
      assertTabs({ active: 0, orientation: 'vertical' })
    })
  })

  describe('`ArrowLeft` key', () => {
    it('should be possible to go to the previous item (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 2 }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 0 })
    })

    it('should be possible to go to the previous item (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 2, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 2 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 0 })
    })

    it('should wrap around at the beginning (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 2 }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 0 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })
    })

    it('should wrap around at the beginning (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 2, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 2 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 0 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 0 })
      await press(Keys.Enter)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 2 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })
    })

    it('should not be possible to go left when in vertical mode (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { vertical: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowLeft)
      // no-op
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should not be possible to go left when in vertical mode (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { vertical: true, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)

      // no-op
      assertTabs({ active: 0, orientation: 'vertical' })
    })
  })

  describe('`ArrowDown` key', () => {
    it('should be possible to go to the next item (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { vertical: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 2, orientation: 'vertical' })
    })

    it('should be possible to go to the next item (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { vertical: true, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 2, orientation: 'vertical' })
    })

    it('should wrap around at the end (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { vertical: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })
    })

    it('should wrap around at the end (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { vertical: true, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 2, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })
    })

    it('should not be possible to go down when in horizontal mode (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, {}, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowDown)
      // no-op
      assertTabs({ active: 0 })
    })

    it('should not be possible to go down when in horizontal mode (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowDown)
      assertTabs({ active: 0 })
      await press(Keys.Enter)

      // no-op
      assertTabs({ active: 0 })
    })
  })

  describe('`ArrowUp` key', () => {
    it('should be possible to go to the previous item (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 2, vertical: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should be possible to go to the previous item (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 2, vertical: true, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 2, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should wrap around at the beginning (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 2, vertical: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })
    })

    it('should wrap around at the beginning (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 2, vertical: true, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 2, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 2, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })
    })

    it('should not be possible to go left when in vertical mode (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, {}, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowUp)
      // no-op
      assertTabs({ active: 0 })
    })

    it('should not be possible to go left when in vertical mode (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowUp)
      assertTabs({ active: 0 })
      await press(Keys.Enter)

      // no-op
      assertTabs({ active: 0 })
    })
  })

  describe('`Home` key', () => {
    it('should be possible to go to the first focusable item (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 1 }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.Home)
      assertTabs({ active: 0 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 1, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.Home)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 0 })
    })
  })

  describe('`PageUp` key', () => {
    it('should be possible to go to the first focusable item (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 1 }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.PageUp)
      assertTabs({ active: 0 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 1, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.PageUp)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 0 })
    })
  })

  describe('`End` key', () => {
    it('should be possible to go to the first focusable item (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 1 }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.End)
      assertTabs({ active: 2 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 1, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.End)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 2 })
    })
  })

  describe('`PageDown` key', () => {
    it('should be possible to go to the first focusable item (activation = `auto`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 1 }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.PageDown)
      assertTabs({ active: 2 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { defaultIndex: 1, manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.PageDown)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 2 })
    })
  })

  describe('`Enter` key', () => {
    it('should be possible to activate the focused tab', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      getByText('Tab 3')?.focus()

      assertActiveElement(getByText('Tab 3'))
      assertTabs({ active: 0 })

      await press(Keys.Enter)
      assertTabs({ active: 2 })
    })
  })

  describe('`Space` key', () => {
    it('should be possible to activate the focused tab', async () => {
      render(
        TestRenderer, {
        allProps: [
          [TabGroup, { manual: true }, [
            [TabList, {}, [
              [Tab, {}, "Tab 1"],
              [Tab, {}, "Tab 2"],
              [Tab, {}, "Tab 3"],
            ]],
            [TabPanels, {}, [
              [TabPanel, {}, "Content 1"],
              [TabPanel, {}, "Content 2"],
              [TabPanel, {}, "Content 3"],
            ]],
          ]],
          [Button, {}, "after"],
        ]
      })

      assertActiveElement(document.body)

      getByText('Tab 3')?.focus()

      assertActiveElement(getByText('Tab 3'))
      assertTabs({ active: 0 })

      await press(Keys.Space)
      assertTabs({ active: 2 })
    })
  })
})

describe('Mouse interactions', () => {
  it('should be possible to click on a tab to focus it', async () => {
    render(
      TestRenderer, {
      allProps: [
        [TabGroup, { defaultIndex: 1 }, [
          [TabList, {}, [
            [Tab, {}, "Tab 1"],
            [Tab, {}, "Tab 2"],
            [Tab, {}, "Tab 3"],
          ]],
          [TabPanels, {}, [
            [TabPanel, {}, "Content 1"],
            [TabPanel, {}, "Content 2"],
            [TabPanel, {}, "Content 3"],
          ]],
        ]],
        [Button, {}, "after"],
      ]
    })

    assertActiveElement(document.body)
    await press(Keys.Tab)
    assertTabs({ active: 1 })

    await click(getByText('Tab 1'))
    assertTabs({ active: 0 })

    await click(getByText('Tab 3'))
    assertTabs({ active: 2 })

    await click(getByText('Tab 2'))
    assertTabs({ active: 1 })
  })

  it('should be a no-op when clicking on a disabled tab', async () => {
    render(
      TestRenderer, {
      allProps: [
        [TabGroup, { defaultIndex: 1 }, [
          [TabList, {}, [
            [Tab, { disabled: true }, "Tab 1"],
            [Tab, {}, "Tab 2"],
            [Tab, {}, "Tab 3"],
          ]],
          [TabPanels, {}, [
            [TabPanel, {}, "Content 1"],
            [TabPanel, {}, "Content 2"],
            [TabPanel, {}, "Content 3"],
          ]],
        ]],
        [Button, {}, "after"],
      ]
    })

    assertActiveElement(document.body)
    await press(Keys.Tab)
    assertTabs({ active: 1 })

    await click(getByText('Tab 1'))
    // No-op, Tab 2 is still active
    assertTabs({ active: 1 })
  })
})

it('should trigger the `on:change` when the tab changes', async () => {
  let changes = jest.fn()

  render(svelte`
    <TabGroup on:change={(e) => changes(e.detail)}>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
        <TabPanel>Content 3</TabPanel>
      </TabPanels>
    </TabGroup>
    <Button>After</Button>
  `);

  await click(getByText('Tab 2'))
  await click(getByText('Tab 3'))
  await click(getByText('Tab 2'))
  await click(getByText('Tab 1'))

  expect(changes).toHaveBeenCalledTimes(4)

  expect(changes).toHaveBeenNthCalledWith(1, 1)
  expect(changes).toHaveBeenNthCalledWith(2, 2)
  expect(changes).toHaveBeenNthCalledWith(3, 1)
  expect(changes).toHaveBeenNthCalledWith(4, 0)
})
