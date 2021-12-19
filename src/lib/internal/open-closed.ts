import { getContext, setContext } from "svelte";
import type { Readable, Writable } from "svelte/store";

export enum State {
  Open,
  Closed,
}

const OPEN_CLOSED_CONTEXT_NAME = "headlessui-open-closed-context";
export function hasOpenClosed() {
  return useOpenClosed() !== undefined;
}

export function useOpenClosed(): Readable<State> | undefined {
  return getContext(OPEN_CLOSED_CONTEXT_NAME);
}

export function useOpenClosedProvider(value: Writable<State>) {
  setContext(OPEN_CLOSED_CONTEXT_NAME, value);
}
