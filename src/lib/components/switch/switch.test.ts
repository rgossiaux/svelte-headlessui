import { render } from "@testing-library/svelte";
import TestRenderer from "../../test-utils/TestRenderer.svelte";
import { Switch } from ".";
import { assertSwitch, getSwitch, SwitchState } from "$lib/test-utils/accessibility-assertions";
import Span from "$lib/internal/elements/Span.svelte";
jest.mock('../../hooks/use-id')

describe('Safe guards', () => {
  it('should be possible to render a Switch without crashing', () => {
    render(TestRenderer, {
      allProps: [
        Switch,
        { checked: false, onChange: console.log }
      ]
    });
  })
})

describe('Rendering', () => {
  // TODO: handle these render prop (slot prop) tests

  // it('should be possible to render an (on) Switch using a render prop', () => {
  //   render(TestRenderer, {
  //     <Switch checked={true} onChange={console.log}>
  //       {({ checked }) => <span>{checked ? 'On' : 'Off'}</span>}
  //     </Switch>
  //   )

  //   assertSwitch({ state: SwitchState.On, textContent: 'On' })
  // })

  // it('should be possible to render an (off) Switch using a render prop', () => {
  //   render(
  //     <Switch checked={false} onChange={console.log}>
  //       {({ checked }) => <span>{checked ? 'On' : 'Off'}</span>}
  //     </Switch>
  //   )

  //   assertSwitch({ state: SwitchState.Off, textContent: 'Off' })
  // })

  it('should be possible to render an (on) Switch using an `as` prop', () => {
    render(TestRenderer, {
      allProps: [
        Switch,
        { as: "span", checked: true, onChange: console.log },
      ]
    });
    assertSwitch({ state: SwitchState.On, tag: 'span' })
  })

  it('should be possible to render an (off) Switch using an `as` prop', () => {
    render(TestRenderer, {
      allProps: [
        Switch,
        { as: "span", checked: false, onChange: console.log },
      ]
    });
    assertSwitch({ state: SwitchState.Off, tag: 'span' })
  })

  it('should be possible to use the switch contents as the label', () => {
    render(TestRenderer, {
      allProps: [
        Switch,
        { checked: false, onChange: console.log },
        [
          Span,
          {},
          "Enable notifications"
        ]
      ]
    });
    assertSwitch({ state: SwitchState.Off, label: 'Enable notifications' })
  })

  describe('`type` attribute', () => {
    it('should set the `type` to "button" by default', async () => {
      render(TestRenderer, {
        allProps: [
          Switch,
          { checked: false, onChange: console.log },
          "Trigger"
        ]
      });

      expect(getSwitch()).toHaveAttribute('type', 'button')
    })

    it('should not set the `type` to "button" if it already contains a `type`', async () => {
      render(TestRenderer, {
        allProps: [
          Switch,
          { checked: false, onChange: console.log, type: "submit" },
          "Trigger"
        ]
      });

      expect(getSwitch()).toHaveAttribute('type', 'submit')
    })

    it('should not set the type if the "as" prop is not a "button"', async () => {
      render(TestRenderer, {
        allProps: [
          Switch,
          { checked: false, onChange: console.log, as: "div" },
          "Trigger"
        ]
      });

      expect(getSwitch()).not.toHaveAttribute('type')
    })
  })
})
