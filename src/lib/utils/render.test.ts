import Render from "$lib/utils/Render.svelte";
// import svelte from "svelte-inline-compile";
import { getByTestId, render } from "@testing-library/svelte";

it("should be possible to use class as a string", () => {
  let { container } = render(Render, {
    as: "div",
    name: "test",
    slotProps: {},
    class: "test-class",
    "data-testid": "test-id",
  });
  let element = getByTestId(container, "test-id");
  expect(element).toHaveClass("test-class");
});

it("should be possible to use class as a function", () => {
  render(Render, {
    as: "div",
    name: "test",
    slotProps: { foo: "bar" },
    class: JSON.stringify,
    id: "test-id",
  });
  expect("" + document.querySelector("#test-id")?.classList).toEqual(
    JSON.stringify({ foo: "bar" })
  );
});

it("should be possible to use style as a string", () => {
  let { container } = render(Render, {
    as: "div",
    name: "test",
    slotProps: {},
    style: "background-color: green",
    "data-testid": "test-id",
  });
  let element = getByTestId(container, "test-id");
  expect(element).toHaveStyle("background-color: green");
});

it("should be possible to use style as a function", () => {
  let { container } = render(Render, {
    as: "div",
    name: "test",
    slotProps: { enabled: true },
    style: ({ enabled }: { enabled: boolean }) => enabled ? "background-color: red" : "background-color: green",
    "data-testid": "test-id",
  });
  let element = getByTestId(container, "test-id");
  expect(element).toHaveStyle("background-color: red");
});
