/**
 * This module contains the create store function to initialize a global store.
 * @module
 */

import { useSyncExternalStore, useRef } from "react";

export type GetState<T> = {
  /**
   * Get current state of store.
   * @example
   * const firstName = personStore.get().firstName
   */
  (): T;
  /**
   * Get current state of store via selector.
   * @example
   * const lastName = personStore.get(p=>p.lastName)
   */
  <R>(selector: (state: T) => R): R;
};

export type SetState<T> = {
  /**
   * Set new state based on previous state.
   * @example
   * personStore.set(prev=>({...prev, firstName: "Bob"}))
   */
  (setter: (prev: T) => T): T;
  /**
   * Set entirely new state.
   * @example
   * personStore.set({firstName: "Bob", lastName: "Johnson"}))
   */
  (newState: T): T;
};

export type UseState<T> = {
  /**
   * Rerenders component on all changes
   * @example
   * const person = personStore.use()
   */
  (): T;
  /**
   * Rerenders component on changes to result of selector
   * @example
   * const firstName = personStore.use(p=>p.firstName)
   */
  <R>(selector: (state: T) => R): R;
  /**
   * Rerenders component on changes to result of selector based on provided isEqual function
   * @example
   * const person = personStore.use(p=>p.id, (a,b)=>a==b)
   */
  <R>(selector: (state: T) => R, isEqual: (a: R, b: R) => boolean): R;
  /**
   * Rerenders component based on provided isEqual function
   * @example
   * const person = personStore.use(null, (a,b)=>a.id==b.id)
   */
  (selector: null, isEqual: (a: T, b: T) => boolean): T;
};

export type Subscribe<T> = {
  /**
   * Adds listener function to store. Runs on all changes.
   * Returns method to unsubscribe
   * @example
   * const removeListener = personStore.subscribe(person=>{
   *    console.log(person)
   * })
   * removeListener()
   */
  (listener: (state: T) => void): () => void;
};

export type Store<T> = {
  /**
   * Get current state of store.
   * @example
   * const firstName = personStore.get().firstName
   * const lastName = personStore.get(p=>p.lastName)
   */
  get: GetState<T>;
  /**
   * Set new state of store and trigger all listeners.
   * @example
   * personStore.set(prev=>({...prev, firstName: "Bob"})) //use current state
   * personStore.set({firstName: "Bob", lastName: "Johnson"})) //set entirely new state
   */
  set: SetState<T>;
  /**
   * Hook to subscribe React component to store.
   * Selector allows any derived value.
   * Then compares with Object.is (React default) or custom isEqual function.
   * @example
   * //will rerender on any changes made to the store
   * const {firstName} = personStore.use()
   * //Will only rerender on changes in lastName
   * const lastName = personStore.use(p=>p.lastName)
   * //Will only rerender if whole year age is different
   * const roundedAge = personStore.use(p=>p.age,(a,b)=>Math.floor(a)===Math.floor(b))
   */
  use: UseState<T>;
  /**
   * Adds listener function to store. Runs on all changes.
   * Returns method to unsubscribe
   * @example
   * const removeListener = personStore.subscribe(person=>{
   *    console.log(person)
   * })
   * removeListener()
   */
  subscribe: Subscribe<T>;
};

/**
 * Creates a store that manages state and provides methods for setting, getting, and merging state values.
 * @template T The type of the store state
 * @param [initialState] The initial state of the store
 * @returns The store object, which includes the set, get, use, and subscribe methods
 * @example
 * const personStore = createStore({
 *      firstName: "Bob",
 *      lasteName: "Johnson"
 * })
 */
export function createStore<T>(initialState?: T): Store<T> {
  const subscriptions = new Set<(state?: T) => void>();

  let state = initialState;

  function get<R>(selector?: (state: T) => R) {
    if (selector instanceof Function) {
      return selector(state);
    } else {
      return state;
    }
  }

  function set(setter: T | ((prev: T) => T)): T {
    state = setter instanceof Function ? setter(state) : setter;
    subscriptions.forEach((listener) => listener(state));
    return state;
  }

  function use(
    selector?: (state: T) => any,
    equals?: (a: any, b: any) => boolean
  ) {
    const snapshot = equals
      ? () => get(useEqual<T, T>(selector, equals))
      : () => get(selector);
    return useSyncExternalStore<T>(subscribe, snapshot);
  }

  function subscribe(listener: (state: T) => void) {
    subscriptions.add(listener);
    return () => {
      subscriptions.delete(listener);
    };
  }

  return { get, set, use, subscribe };
}

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
