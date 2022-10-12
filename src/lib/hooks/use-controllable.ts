import { writable, type Writable } from "svelte/store";

export function useControllable<T>(
  controlledValue: T | undefined,
  onChange?: (value: T) => void,
  defaultValue?: T
) {
  let internalValue = defaultValue;
  let isControlled = controlledValue !== undefined;

  //console.log("useControllable", isControlled, controlledValue, internalValue);

  const managedValue: Writable<T> = writable(
    isControlled ? controlledValue : internalValue
  );

  return [
    managedValue,
    function (value: unknown) {
      //console.log("useControllable function(value)", value);

      if (isControlled) {
        managedValue.set(controlledValue as T);
        return onChange?.(value as T);
      } else {
        internalValue = value as T;
        managedValue.set(internalValue as T);
        return onChange?.(value as T);
      }
    },
  ] as const;
}
