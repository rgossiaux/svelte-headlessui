import { render } from "@testing-library/svelte";
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from ".";
import {
  assertActiveElement,
  assertSwitch,
  getByText,
  getSwitch,
  getSwitchLabel,
  SwitchState,
} from "$lib/test-utils/accessibility-assertions";
import ManagedSwitch from "./_ManagedSwitch.svelte";
import { click, Keys, press } from "$lib/test-utils/interactions";
import svelte from "svelte-inline-compile";
jest.mock("../../hooks/use-id");

describe("Safe guards", () => {
  it("should be possible to render a Switch without crashing", () => {
    render(svelte`
      <Switch checked={false} on:change={console.log} />
    `);
  });
});

describe("Rendering", () => {
  it('(on) Switch should have a slot prop', () => {
    render(svelte`
      <Switch checked={true} on:change={console.log} let:checked>
        <span>{checked ? 'On' : 'Off'}</span>
      </Switch>
    `)

    assertSwitch({ state: SwitchState.On, textContent: 'On' })
  })

  it('(off) Switch should have a slot prop', () => {
    render(svelte`
      <Switch checked={false} on:change={console.log} let:checked>
        <span>{checked ? 'On' : 'Off'}</span>
      </Switch>
    `)

    assertSwitch({ state: SwitchState.Off, textContent: 'Off' })
  })

  it("should be possible to render an (on) Switch using an `as` prop", () => {
    render(svelte`
      <Switch as={"span"} checked={true} on:change={console.log} />
    `);
    assertSwitch({ state: SwitchState.On, tag: "span" });
  });

  it("should be possible to render an (off) Switch using an `as` prop", () => {
    render(svelte`
      <Switch as={"span"} checked={false} on:change={console.log} />
    `);
    assertSwitch({ state: SwitchState.Off, tag: "span" });
  });

  it("should be possible to use the switch contents as the label", () => {
    render(svelte`
      <Switch checked={false} on:change={console.log}>
        <span>Enable notifications</span>
      </Switch>
    `)
    assertSwitch({ state: SwitchState.Off, label: "Enable notifications" });
  });

  describe("`type` attribute", () => {
    it('should set the `type` to "button" by default', async () => {
      render(svelte`
        <Switch checked={false} on:change={console.log}>Trigger</Switch>
      `);

      expect(getSwitch()).toHaveAttribute("type", "button");
    });

    it('should not set the `type` to "button" if it already contains a `type`', async () => {
      render(svelte`
        <Switch checked={false} on:change={console.log} type={"submit"}>Trigger</Switch>
      `);

      expect(getSwitch()).toHaveAttribute("type", "submit");
    });

    it('should not set the type if the "as" prop is not a "button"', async () => {
      render(svelte`
        <Switch checked={false} on:change={console.log} as={"div"}>Trigger</Switch>
      `);

      expect(getSwitch()).not.toHaveAttribute("type");
    });
  });
});

describe("Render composition", () => {
  it("should be possible to render a Switch.Group, Switch and Switch.Label", () => {
    render(svelte`
      <SwitchGroup>
        <Switch checked={false} on:change={console.log} />
        <SwitchLabel>Enable notifications</SwitchLabel>
      </SwitchGroup>
    `);

    assertSwitch({ state: SwitchState.Off, label: "Enable notifications" });
  });

  it("should be possible to render a Switch.Group, Switch and Switch.Label (before the Switch)", () => {
    render(svelte`
      <SwitchGroup>
        <SwitchLabel>Label B</SwitchLabel>
        <Switch checked={false} on:change={console.log}>Label A</Switch>
      </SwitchGroup>
    `);

    // Warning! Using aria-label or aria-labelledby will hide any descendant content from assistive
    // technologies.
    //
    // Thus: Label A should not be part of the "label" in this case
    assertSwitch({ state: SwitchState.Off, label: "Label B" });
  });

  it("should be possible to render a Switch.Group, Switch and Switch.Label (after the Switch)", () => {
    render(svelte`
      <SwitchGroup>
        <Switch checked={false} on:change={console.log}>Label A</Switch>
        <SwitchLabel>Label B</SwitchLabel>
      </SwitchGroup>
    `);

    // Warning! Using aria-label or aria-labelledby will hide any descendant content from assistive
    // technologies.
    //
    // Thus: Label A should not be part of the "label" in this case
    assertSwitch({ state: SwitchState.Off, label: "Label B" });
  });

  it("should be possible to render a Switch.Group, Switch and Switch.Description (before the Switch)", async () => {
    render(svelte`
      <SwitchGroup>
        <SwitchDescription>This is an important feature</SwitchDescription>
        <Switch checked={false} on:change={console.log} />
      </SwitchGroup>
    `);

    assertSwitch({
      state: SwitchState.Off,
      description: "This is an important feature",
    });
  });

  it("should be possible to render a Switch.Group, Switch and Switch.Description (after the Switch)", () => {
    render(svelte`
      <SwitchGroup>
        <Switch checked={false} on:change={console.log} />
        <SwitchDescription>This is an important feature</SwitchDescription>
      </SwitchGroup>
    `);

    assertSwitch({
      state: SwitchState.Off,
      description: "This is an important feature",
    });
  });

  it("should be possible to render a Switch.Group, Switch, Switch.Label and Switch.Description", () => {
    render(svelte`
      <SwitchGroup>
        <SwitchLabel>Label A</SwitchLabel>
        <Switch checked={false} on:change={console.log} />
        <SwitchDescription>This is an important feature</SwitchDescription>
      </SwitchGroup>
    `);

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
      render(svelte`
        <ManagedSwitch />
      `);

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
      render(svelte`
        <ManagedSwitch onChange={handleChange}/>
      `);

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
      render(svelte`
        <div>
          <Switch checked={false} on:change={console.log} />
          <button id="btn">Other element</button>
        </div>
      `)

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
    render(svelte`
      <ManagedSwitch />
    `);

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
    render(svelte`
      <SwitchGroup>
        <ManagedSwitch />
        <SwitchLabel>The label</SwitchLabel>
      </SwitchGroup>
    `);

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
    render(svelte`
      <SwitchGroup>
        <ManagedSwitch />
        <SwitchLabel passive={true}>The label</SwitchLabel>
      </SwitchGroup>
    `);

    // Ensure checkbox is off
    assertSwitch({ state: SwitchState.Off });

    // Toggle
    await click(getSwitchLabel());

    // Ensure state is still off
    assertSwitch({ state: SwitchState.Off });
  });
});

describe("`Enter`", () => {
  it("should submit the form on `Enter`", async () => {    
    let submitFn = jest.fn();
    
    render(svelte`
      <script>
        let enabled = false
      </script>         

      <form on:submit={(event) => {
        event.preventDefault()
        submitFn([...new FormData(event.currentTarget).entries()])
      }}>        
        <Switch name="notifications" checked={enabled} on:change={(e) => (enabled = e.detail)}>Enable notifications</Switch>
        <button type="submit">Submit</button>
      </form>
    `);

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submitFn).lastCalledWith([]) // no data

    // Toggle
    await click(getSwitch())

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submitFn).lastCalledWith([['notifications', 'on']])
  });
});

describe('Form compatibility', () => {
  it('should be possible to submit a form with an boolean value', async () => {
    
    let submitFn = jest.fn();
    
    render(svelte`
      <script>
        let enabled = false
      </script>         

      <form on:submit={(event) => {
        event.preventDefault()
        submitFn([...new FormData(event.currentTarget).entries()])
      }}>        
        <SwitchGroup>
          <Switch name="notifications" checked={enabled} on:change={(e) => (enabled = e.detail)} />
          <SwitchLabel>Enable notifications</SwitchLabel>
        </SwitchGroup>        
        <button type="submit">Submit</button>
      </form>
    `);

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submitFn).lastCalledWith([]) // no data

    // Toggle
    await click(getSwitchLabel())

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submitFn).lastCalledWith([['notifications', 'on']])
  })

  it('should be possible to submit a form with a provided string value', async () => {
    let submitFn = jest.fn();
    
    render(svelte`
      <script>
        let enabled = false
      </script>         

      <form on:submit={(event) => {
        event.preventDefault()
        submitFn([...new FormData(event.currentTarget).entries()])
      }}>        
        <SwitchGroup>
          <Switch name="fruit" checked={enabled} value="apple" on:change={(e) => (enabled = e.detail)} />
          <SwitchLabel>Apple</SwitchLabel>
        </SwitchGroup>        
        <button type="submit">Submit</button>
      </form>
    `);

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submitFn).lastCalledWith([]) // no data

    // Toggle
    await click(getSwitchLabel())

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submitFn).lastCalledWith([['fruit', 'apple']])
  })
})