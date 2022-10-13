import { writable, type Writable } from "svelte/store";

export function useControllable<T>(
  controlledValue: T | undefined,
  onChange?: (value: T) => void,
  defaultValue?: T
) {
  let internalValue = defaultValue;
  let isControlled = controlledValue !== undefined;

  const valueStore: Writable<T> = writable(
    isControlled ? controlledValue : internalValue
  );

  return [
    valueStore,
    function (value: unknown) {
      if (isControlled) {
        valueStore.set(value as T);
        return onChange?.(value as T);
      } else {
        internalValue = value as T;
        valueStore.set(internalValue);
        return onChange?.(value as T);
      }
    },
  ] as const;
}
