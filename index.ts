import { useSyncExternalStore, useRef } from "react";

/**
 * Creates a store that manages state and provides methods for setting, getting, and using state values.
 * ```ts
 * const personStore = new Store({
 *      firstName: "Bob",
 *      lasteName: "Johnson"
 * })
 * ```
 */
export class Store<T> {
  private state: T;
  private subscriptions: Set<(state?: T) => void>;

  constructor(initialState?: T) {
    this.state = initialState;
    this.subscriptions = new Set<(state?: T) => void>();
  }

  /**
   * Get current state of store.
   * ```ts
   * const firstName = personStore.get().firstName
   * ```
   */
  get(): T;
  /**
   * Get current state of store via selector.
   * ```ts
   * const lastName = personStore.get(p=>p.lastName)
   * ```
   */
  get<R>(selector: (state: T) => R): R;
  get<R>(selector?: (state: T) => R) {
    if (selector instanceof Function) {
      return selector(this.state);
    } else {
      return this.state;
    }
  }

  /**
   * Set entirely new state.
   * ```ts
   * personStore.set({firstName: "Bob", lastName: "Johnson"}))
   * ```
   */
  set(newState: T): T;
  /**
   * Set new state based on previous state.
   * ```ts
   * personStore.set(prev=>({...prev, firstName: "Bob"}))
   * ```
   */
  set(setter: (prev: T) => T): T;
  set(setter: T | ((prev: T) => T)) {
    this.state = setter instanceof Function ? setter(this.state) : setter;
    this.subscriptions.forEach((listener) => listener(this.state));
    return this.state;
  }

  /**
   * Subscribe component to rerender on any state change
   * ```ts
   * const person = personStore.use()
   * ```
   */
  use(): T;
  /**
   * Subscribe component to rerender on selected value change
   * ```ts
   * const firstName = personStore.use(p=>p.firstName)
   * ```
   */
  use<R>(selector: (state: T) => any): R;
  use(selector?: (state: T) => any) {
    const snapshot = () => this.get(selector);
    return useSyncExternalStore<T>(this.subscribe, snapshot);
  }

  /**
   * Subscribe listener to get called on any state change
   * Returns method to unsubscribe
   * ```ts
   * const removeListener = personStore.subscribe(person=>{
   *    console.log(person)
   * })
   * removeListener()
   * ```
   */
  subscribe(listener: (state: T) => void): ()=> void {
    this.subscriptions.add(listener);
    return () => {
      this.subscriptions.delete(listener);
    };
  }
}


/**
 * Hook to only update state if different using custom equal function
 * @param selector select dervied value
 * @param equals function to compare derived value
 * @returns updater function to pass to set method
 */
export function useEqual<S, U>(
  selector: (state: S) => U,
  equals: (a: any, b: any) => boolean
): (state: S) => U {
  const prev = useRef<U>();

  return (state) => {
    const next = selector(state);
    return equals(prev.current, next)
      ? (prev.current as U)
      : (prev.current = next);
  };
}
