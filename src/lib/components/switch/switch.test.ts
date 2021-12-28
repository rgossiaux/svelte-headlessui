import { render } from "@testing-library/svelte";
import TestRenderer from "../../test-utils/TestRenderer.svelte";
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from ".";
import {
  assertActiveElement,
  assertSwitch,
  getSwitch,
  getSwitchLabel,
  SwitchState,
} from "$lib/test-utils/accessibility-assertions";
import Button from "$lib/internal/elements/Button.svelte";
import Div from "$lib/internal/elements/Div.svelte";
import Span from "$lib/internal/elements/Span.svelte";
import ManagedSwitch from "./_ManagedSwitch.svelte";
import { click, Keys, press } from "$lib/test-utils/interactions";
jest.mock("../../hooks/use-id");

describe("Safe guards", () => {
  it("should be possible to render a Switch without crashing", () => {
    render(TestRenderer, {
      allProps: [Switch, { checked: false, onChange: console.log }],
    });
  });
});

describe("Rendering", () => {
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

  it("should be possible to render an (on) Switch using an `as` prop", () => {
    render(TestRenderer, {
      allProps: [Switch, { as: "span", checked: true, onChange: console.log }],
    });
    assertSwitch({ state: SwitchState.On, tag: "span" });
  });

  it("should be possible to render an (off) Switch using an `as` prop", () => {
    render(TestRenderer, {
      allProps: [Switch, { as: "span", checked: false, onChange: console.log }],
    });
    assertSwitch({ state: SwitchState.Off, tag: "span" });
  });

  it("should be possible to use the switch contents as the label", () => {
    render(TestRenderer, {
      allProps: [
        Switch,
        { checked: false, onChange: console.log },
        [Span, {}, "Enable notifications"],
      ],
    });
    assertSwitch({ state: SwitchState.Off, label: "Enable notifications" });
  });

  describe("`type` attribute", () => {
    it('should set the `type` to "button" by default', async () => {
      render(TestRenderer, {
        allProps: [
          Switch,
          { checked: false, onChange: console.log },
          "Trigger",
        ],
      });

      expect(getSwitch()).toHaveAttribute("type", "button");
    });

    it('should not set the `type` to "button" if it already contains a `type`', async () => {
      render(TestRenderer, {
        allProps: [
          Switch,
          { checked: false, onChange: console.log, type: "submit" },
          "Trigger",
        ],
      });

      expect(getSwitch()).toHaveAttribute("type", "submit");
    });

    it('should not set the type if the "as" prop is not a "button"', async () => {
      render(TestRenderer, {
        allProps: [
          Switch,
          { checked: false, onChange: console.log, as: "div" },
          "Trigger",
        ],
      });

      expect(getSwitch()).not.toHaveAttribute("type");
    });
  });
});

describe("Render composition", () => {
  it("should be possible to render a Switch.Group, Switch and Switch.Label", () => {
    render(TestRenderer, {
      allProps: [
        SwitchGroup,
        {},
        [
          [Switch, { checked: false, onChange: console.log }],
          [SwitchLabel, {}, "Enable notifications"],
        ],
      ],
    });

    assertSwitch({ state: SwitchState.Off, label: "Enable notifications" });
  });

  it("should be possible to render a Switch.Group, Switch and Switch.Label (before the Switch)", () => {
    render(TestRenderer, {
      allProps: [
        SwitchGroup,
        {},
        [
          [SwitchLabel, {}, "Label B"],
          [Switch, { checked: false, onChange: console.log }, "Label A"],
        ],
      ],
    });

    // Warning! Using aria-label or aria-labelledby will hide any descendant content from assistive
    // technologies.
    //
    // Thus: Label A should not be part of the "label" in this case
    assertSwitch({ state: SwitchState.Off, label: "Label B" });
  });

  it("should be possible to render a Switch.Group, Switch and Switch.Label (after the Switch)", () => {
    render(TestRenderer, {
      allProps: [
        SwitchGroup,
        {},
        [
          [Switch, { checked: false, onChange: console.log }, "Label A"],
          [SwitchLabel, {}, "Label B"],
        ],
      ],
    });

    // Warning! Using aria-label or aria-labelledby will hide any descendant content from assistive
    // technologies.
    //
    // Thus: Label A should not be part of the "label" in this case
    assertSwitch({ state: SwitchState.Off, label: "Label B" });
  });

  it("should be possible to render a Switch.Group, Switch and Switch.Description (before the Switch)", async () => {
    render(TestRenderer, {
      allProps: [
        SwitchGroup,
        {},
        [
          [SwitchDescription, {}, "This is an important feature"],
          [Switch, { checked: false, onChange: console.log }],
        ],
      ],
    });

    assertSwitch({
      state: SwitchState.Off,
      description: "This is an important feature",
    });
  });

  it("should be possible to render a Switch.Group, Switch and Switch.Description (after the Switch)", () => {
    render(TestRenderer, {
      allProps: [
        SwitchGroup,
        {},
        [
          [Switch, { checked: false, onChange: console.log }],
          [SwitchDescription, {}, "This is an important feature"],
        ],
      ],
    });

    assertSwitch({
      state: SwitchState.Off,
      description: "This is an important feature",
    });
  });

  it("should be possible to render a Switch.Group, Switch, Switch.Label and Switch.Description", () => {
    render(TestRenderer, {
      allProps: [
        SwitchGroup,
        {},
        [
          [SwitchLabel, {}, "Label A"],
          [Switch, { checked: false, onChange: console.log }],
          [SwitchDescription, {}, "This is an important feature"],
        ],
      ],
    });

    assertSwitch({
      state: SwitchState.Off,
      label: "Label A",
      description: "This is an important feature",
    });
  });
});

describe("Keyboard interactions", () => {
  describe("`Space` key", () => {
    it("should be possible to toggle the Switch with Space", async () => {
      render(TestRenderer, {
        allProps: [ManagedSwitch, {}],
      });

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off });

      // Focus the switch
      getSwitch()?.focus();

      // Toggle
      await press(Keys.Space);

      // Ensure state is on
      assertSwitch({ state: SwitchState.On });

      // Toggle
      await press(Keys.Space);

      // Ensure state is off
      assertSwitch({ state: SwitchState.Off });
    });
  });

  describe("`Enter` key", () => {
    it("should not be possible to use Enter to toggle the Switch", async () => {
      let handleChange = jest.fn();
      render(TestRenderer, {
        allProps: [ManagedSwitch, { onChange: handleChange }],
      });

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off });

      // Focus the switch
      getSwitch()?.focus();

      // Try to toggle
      await press(Keys.Enter);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("`Tab` key", () => {
    it("should be possible to tab away from the Switch", async () => {
      render(TestRenderer, {
        allProps: [
          Div,
          {},
          [
            [Switch, { checked: false, onChange: console.log }],
            [Button, { id: "btn" }, "Other element"],
          ],
        ],
      });

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off });

      // Focus the switch
      getSwitch()?.focus();

      // Expect the switch to be active
      assertActiveElement(getSwitch());

      // Toggle
      await press(Keys.Tab);

      // Expect the button to be active
      assertActiveElement(document.getElementById("btn"));
    });
  });
});

describe("Mouse interactions", () => {
  it("should be possible to toggle the Switch with a click", async () => {
    render(TestRenderer, {
      allProps: [ManagedSwitch, {}],
    });

    // Ensure checkbox is off
    assertSwitch({ state: SwitchState.Off });

    // Toggle
    await click(getSwitch());

    // Ensure state is on
    assertSwitch({ state: SwitchState.On });

    // Toggle
    await click(getSwitch());

    // Ensure state is off
    assertSwitch({ state: SwitchState.Off });
  });

  it("should be possible to toggle the Switch with a click on the Label", async () => {
    render(TestRenderer, {
      allProps: [
        SwitchGroup,
        {},
        [
          [ManagedSwitch, {}],
          [SwitchLabel, {}, "The label"],
        ],
      ],
    });

    // Ensure checkbox is off
    assertSwitch({ state: SwitchState.Off });

    // Toggle
    await click(getSwitchLabel());

    // Ensure the switch is focused
    assertActiveElement(getSwitch());

    // Ensure state is on
    assertSwitch({ state: SwitchState.On });

    // Toggle
    await click(getSwitchLabel());

    // Ensure the switch is focused
    assertActiveElement(getSwitch());

    // Ensure state is off
    assertSwitch({ state: SwitchState.Off });
  });

  it("should not be possible to toggle the Switch with a click on the Label (passive)", async () => {
    render(TestRenderer, {
      allProps: [
        SwitchGroup,
        {},
        [
          [ManagedSwitch, {}],
          [SwitchLabel, { passive: true }, "The label"],
        ],
      ],
    });

    // Ensure checkbox is off
    assertSwitch({ state: SwitchState.Off });

    // Toggle
    await click(getSwitchLabel());

    // Ensure state is still off
    assertSwitch({ state: SwitchState.Off });
  });
});
