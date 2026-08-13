/**
 * Tiny event bus for the auto-save indicator.
 * Avoids putting volatile state in a context that would re-render
 * all admin pages every time a setting is saved.
 */
type SaveState = "idle" | "saving" | "saved" | "error";
type Listener = (state: SaveState) => void;

let current: SaveState = "idle";
const listeners = new Set<Listener>();

export const saveSignal = {
  emit(state: SaveState) {
    current = state;
    listeners.forEach((fn) => fn(state));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    fn(current); // immediately send current state
    return () => listeners.delete(fn);
  },
};
