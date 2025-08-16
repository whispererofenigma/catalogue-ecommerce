import { useEffect, RefObject } from 'react';

// Define the type for the event to handle both mouse and touch events.
type Event = MouseEvent | TouchEvent;

/**
 * A custom React hook that triggers a callback when a click is detected outside of a specified element.
 * @param ref - A React ref object attached to the element to monitor for outside clicks.
 * The ref's type must allow for a null value, as it will be null on the initial render.
 * @param handler - The callback function to execute when an outside click is detected.
 */
export const useOnClickOutside = (
  // This is the crucial fix: The ref's type must accept `HTMLElement | null`.
  // This perfectly matches the type provided by `useRef<HTMLElement>(null)` in your Navbar component.
  ref: RefObject<HTMLElement | null>,
  handler: (event: Event) => void
) => {
  useEffect(() => {
    // Define the event listener function.
    const listener = (event: Event) => {
      // Get the current element from the ref.
      const el = ref.current;

      // --- The Core Logic ---
      // 1. If the element doesn't exist yet (it's null), or
      // 2. If the click target is *inside* the element (`el.contains(...)`),
      // then do nothing.
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      // If the click was outside, call the provided handler function.
      handler(event);
    };

    // Add the event listeners to the document.
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Cleanup function: Remove the event listeners when the component unmounts
    // or when the ref/handler dependencies change.
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // The effect re-runs only if the ref or handler function changes.
};
