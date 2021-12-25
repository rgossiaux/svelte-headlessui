import { render } from "@testing-library/svelte";
import TestRenderer from "../../test-utils/TestRenderer.svelte";
import { Switch } from ".";
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
