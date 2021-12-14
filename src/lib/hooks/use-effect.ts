export function useEffect(fn, ...args) {
    if (fn.__cleanup) {
        fn.__cleanup();
    }
    fn.__cleanup = fn(...args);
}
