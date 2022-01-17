import { render } from "@testing-library/svelte";
import Label from "./Label.svelte";
import LabelProvider from "./LabelProvider.svelte";
import svelte from "svelte-inline-compile";

let mockId = 0;
jest.mock("../../hooks/use-id", () => {
  return {
    useId: jest.fn(() => ++mockId),
  };
});

beforeEach(() => (mockId = 0));
afterAll(() => jest.restoreAllMocks());

it("should be possible to use a LabelProvider without using a Label", async () => {
  let { container } = render(svelte`
  <LabelProvider let:labelledby>
    <div aria-labelledby={labelledby}>
      No label
    </div>
  </LabelProvider>
`);
  expect(container.firstChild?.firstChild).toMatchInlineSnapshot(`
    <div>
      No label
    </div>
  `);
});

it("should be possible to use a LabelProvider and a single Label, and have them linked", async () => {
  let { container } = render(svelte`
  <LabelProvider let:labelledby>
    <Label>I am a label</Label>
    <div aria-labelledby={labelledby}>
      <span>Contents</span>
    </div>
  </LabelProvider>
`);
  expect(container.firstChild?.firstChild).toMatchInlineSnapshot(`
    <label
      id="headlessui-label-1"
    >
      I am a label
    </label>
  `);
});

it("should be possible to use a LabelProvider and multiple Label components, and have them linked", async () => {
  let { container } = render(svelte`
  <LabelProvider let:labelledby>
    <Label>I am a label</Label>
    <div aria-labelledby={labelledby}>
      <span>Contents</span>
    </div>
    <Label>I am also a label</Label>
  </LabelProvider>
`);
  expect(container.firstChild?.firstChild).toMatchInlineSnapshot(`
    <label
      id="headlessui-label-1"
    >
      I am a label
    </label>
  `);
});
