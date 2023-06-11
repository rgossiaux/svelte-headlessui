import { render } from "@testing-library/svelte";
import Label from "./Label.svelte";
import LabelProvider from "./LabelProvider.svelte";
import svelte from "svelte-inline-compile";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import { writable, type Writable } from "svelte/store";
import { tick } from "svelte";

let mockId = 0;
jest.mock("../../hooks/use-id", () => {
  return {
    useId: jest.fn(() => ++mockId),
  };
});

beforeEach(() => (mockId = 0));
afterAll(() => jest.restoreAllMocks());

beforeEach(() => {
  document.body.innerHTML = "";
});

it(
  "should error when we are using a <Label /> without a parent <LabelProvider />",
  suppressConsoleLogs(async () => {
    expect(() => render(Label)).toThrowError(
      `You used a <Label /> component, but it is not inside a relevant parent.`
    );
  })
);

it("should be possible to use a LabelProvider without using a Label", async () => {
  let { container } = render(svelte`
  <LabelProvider name={"test"} let:labelledby>
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
  <LabelProvider name={"test"} let:labelledby>
    <div aria-labelledby={labelledby}>
      <Label>I am a label</Label>
      <span>Contents</span>
    </div>
  </LabelProvider>
`);
  expect(container.firstChild?.firstChild).toMatchInlineSnapshot(`
    <div
      aria-labelledby="headlessui-label-1"
    >
      <label
        id="headlessui-label-1"
      >
        I am a label
      </label>
      
      
      
       
      <span>
        Contents
      </span>
    </div>
  `);
});

it("should be possible to use a LabelProvider and multiple Label components, and have them linked", async () => {
  let { container } = render(svelte`
  <LabelProvider name={"test"} let:labelledby>
    <div aria-labelledby={labelledby}>
      <Label>I am a label</Label>
      <span>Contents</span>
      <Label>I am also a label</Label>
    </div>
  </LabelProvider>
`);
  expect(container.firstChild?.firstChild).toMatchInlineSnapshot(`
    <div
      aria-labelledby="headlessui-label-1 headlessui-label-2"
    >
      <label
        id="headlessui-label-1"
      >
        I am a label
      </label>
      
      
      
       
      <span>
        Contents
      </span>
       
      <label
        id="headlessui-label-2"
      >
        I am also a label
      </label>
      
      
      
    </div>
  `);
});

it("should be possible to render a Label with an `as` prop", async () => {
  let { container } = render(svelte`
  <LabelProvider name={"test"} let:labelledby>
    <div aria-labelledby={labelledby}>
      <Label as="p">I am a label</Label>
      <span>Contents</span>
    </div>
  </LabelProvider>
`);
  expect(container.firstChild?.firstChild).toMatchInlineSnapshot(`
    <div
      aria-labelledby="headlessui-label-1"
    >
      <p
        id="headlessui-label-1"
      >
        I am a label
      </p>
      
      
      
       
      <span>
        Contents
      </span>
    </div>
  `);
});

it("should be possible to change the props of a Label", async () => {
  let classStore = writable<string | null>(null);
  let { container } = render(svelte`
  <LabelProvider name={"test"} let:labelledby>
    <div aria-labelledby={labelledby}>
      <Label class={$classStore}>I am a label</Label>
      <span>Contents</span>
    </div>
  </LabelProvider>
`);

  expect(container.firstChild?.firstChild).toMatchInlineSnapshot(`
    <div
      aria-labelledby="headlessui-label-1"
    >
      <label
        id="headlessui-label-1"
      >
        I am a label
      </label>
      
      
      
       
      <span>
        Contents
      </span>
    </div>
  `);

  classStore.set("test-class");
  await tick();

  expect(container.firstChild?.firstChild).toMatchInlineSnapshot(`
    <div
      aria-labelledby="headlessui-label-1"
    >
      <label
        class="test-class"
        id="headlessui-label-1"
      >
        I am a label
      </label>
      
      
      
       
      <span>
        Contents
      </span>
    </div>
  `);
});

it("should be possible to use a LabelProvider with slot props", async () => {
  let { container } = render(svelte`
  <LabelProvider name={"test"} slotProps={{num: 12345}} let:labelledby>
    <div aria-labelledby={labelledby}>
      <Label let:num>{num}</Label>
      <span>Contents</span>
    </div>
  </LabelProvider>
`);
  expect(container.firstChild?.firstChild).toMatchInlineSnapshot(`
    <div
      aria-labelledby="headlessui-label-1"
    >
      <label
        id="headlessui-label-1"
      >
        12345
      </label>
      
      
      
       
      <span>
        Contents
      </span>
    </div>
  `);
});
