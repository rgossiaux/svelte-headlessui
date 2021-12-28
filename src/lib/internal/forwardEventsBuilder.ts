// This is a modified version of code from hperrin/svelte-material-ui
import type { SvelteComponent } from "svelte";
import {
  bubble,
  listen,
  prevent_default,
  stop_propagation,
} from "svelte/internal";

const MODIFIER_DIVIDER = "!";
const modifierRegex = new RegExp(
  `^[^${MODIFIER_DIVIDER}]+(?:${MODIFIER_DIVIDER}(?:preventDefault|stopPropagation|passive|nonpassive|capture|once|self))+$`
);

type ForwardException = string | { name: string; shouldExclude: () => boolean };
export function forwardEventsBuilder(
  component: SvelteComponent,
  except: ForwardException[] = []
) {
  // This is our pseudo $on function. It is defined on component mount.
  let $on: (eventType: string, callback: (event: any) => void) => () => void;
  // This is a list of events bound before mount.
  let events: [string, (event: any) => void][] = [];

  // And we override the $on function to forward all bound events.
  component.$on = (fullEventType: string, callback: (event: any) => void) => {
    let eventType = fullEventType;
    let destructor = () => {};
    for (let exception of except) {
      if (typeof exception === "string" && exception === eventType) {
        // Bail out of the event forwarding and run the normal Svelte $on() code
        const callbacks =
          component.$$.callbacks[eventType] ||
          (component.$$.callbacks[eventType] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      }
      if (typeof exception === "object" && exception["name"] === eventType) {
        let oldCallback = callback;
        callback = (...props) => {
          if (
            !(typeof exception === "object" && exception["shouldExclude"]())
          ) {
            oldCallback(...props);
          }
        };
      }
    }
    if ($on) {
      // The event was bound programmatically.
      destructor = $on(eventType, callback);
    } else {
      // The event was bound before mount by Svelte.
      events.push([eventType, callback]);
    }
    return () => {
      destructor();
    };
  };

  function forward(e: Event) {
    // Internally bubble the event up from Svelte components.
    bubble(component, e);
  }

  return (node: HTMLElement | SVGElement) => {
    const destructors: (() => void)[] = [];
    const forwardDestructors: { [k: string]: () => void } = {};

    // This function is responsible for listening and forwarding
    // all bound events.
    $on = (fullEventType, callback) => {
      let eventType = fullEventType;
      let handler = callback;
      // DOM addEventListener options argument.
      let options: boolean | AddEventListenerOptions = false;
      const modifierMatch = eventType.match(modifierRegex);
      if (modifierMatch) {
        // Parse the event modifiers.
        // Supported modifiers:
        // - preventDefault
        // - stopPropagation
        // - passive
        // - nonpassive
        // - capture
        // - once
        const parts = eventType.split(MODIFIER_DIVIDER);
        eventType = parts[0];
        const eventOptions: {
          passive?: true;
          nonpassive?: true;
          capture?: true;
          once?: true;
          preventDefault?: true;
          stopPropagation?: true;
        } = Object.fromEntries(parts.slice(1).map((mod) => [mod, true]));
        if (eventOptions.passive) {
          options = options || ({} as AddEventListenerOptions);
          options.passive = true;
        }
        if (eventOptions.nonpassive) {
          options = options || ({} as AddEventListenerOptions);
          options.passive = false;
        }
        if (eventOptions.capture) {
          options = options || ({} as AddEventListenerOptions);
          options.capture = true;
        }
        if (eventOptions.once) {
          options = options || ({} as AddEventListenerOptions);
          options.once = true;
        }
        if (eventOptions.preventDefault) {
          handler = prevent_default(handler);
        }
        if (eventOptions.stopPropagation) {
          handler = stop_propagation(handler);
        }
      }

      // Listen for the event directly, with the given options.
      const off = listen(node, eventType, handler, options);
      const destructor = () => {
        off();
        const idx = destructors.indexOf(destructor);
        if (idx > -1) {
          destructors.splice(idx, 1);
        }
      };

      destructors.push(destructor);

      // Forward the event from Svelte.
      if (!(eventType in forwardDestructors)) {
        forwardDestructors[eventType] = listen(node, eventType, forward);
      }

      return destructor;
    };

    for (let i = 0; i < events.length; i++) {
      // Listen to all the events added before mount.
      $on(events[i][0], events[i][1]);
    }

    return {
      destroy: () => {
        // Remove all event listeners.
        for (let i = 0; i < destructors.length; i++) {
          destructors[i]();
        }

        // Remove all event forwarders.
        for (let entry of Object.entries(forwardDestructors)) {
          entry[1]();
        }
      },
    };
  };
}
