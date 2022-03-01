import { onDestroy } from "svelte";

export function createRunWithCleanup() {
  let cleanup: { [key: string]: () => any } = {};

  onDestroy(() => {
    for (const id in cleanup) {
      cleanup[id]();
      delete cleanup[id];
    }
  })

  return (fn: () => any, id: string) => {
    if (cleanup[id]) {
      cleanup[id]();
      delete cleanup[id];
    }

    const result = fn();
    if (typeof result === "function") {
      cleanup[id] = result;
    }
  }
}
