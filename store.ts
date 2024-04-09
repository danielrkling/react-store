import React from 'react'

export interface SetState<T> {
    (set: T | ((prev: T) => T)): T
}

interface GetState<T> {
    (): T
    <R>(selector: (state: T) => R): R
}

interface UseState<T> {
    (): T
    <R>(selector: (state: T) => R): R
    (selector: null, equals: (a: any, b: any) => boolean): T
    <R>(selector: (state: T) => R, equals: (a: any, b: any) => boolean): R
}

interface Subscribe<T>{
    (listener: (state?: T) => void): ()=>void
}

interface Store<T> {
    set: SetState<T>
    get: GetState<T>
    use: UseState<T>
    subscribe: Subscribe<T>
}

type Mutations<T> = { [k: string]: any } & { [K in keyof Store<T>]?: never }

/**
 * Creates a store that manages state and provides methods for setting, getting, and merging state values.
 * @template T The type of the store state
 * @param [initialState] The initial state of the store
 * @param  [mutations] An optional function that defines custom mutations for the store.
 * @param  [createStatusStore] A flag that creates an additional store to track the status of async mutations
 * @returns The store object, which includes the set, get, merge, and use methods, along with any custom mutations defined by the mutations parameter.
 * @example
 * const booleanStore = createStore(
 * false,
 * ({set})=>{
 *  toggle: ()=>set(prev=>!prev)
 * })
 */
export function createStore<T>():Store<any>
export function createStore<T>(initialState: T):Store<T>
export function createStore<T,M extends Mutations<T> = Mutations<T>>(initialState: T, mutations: (store: Store<T>) => M ):Store<T> & M
export function createStore<T, M extends Mutations<T> = Mutations<T>>(
    initialState?: T,
    mutations?: (store: Store<T>) => M,
) {
    const subscriptions = new Set<(state?: T) => void>();    

    /**
     * @description Gets the state of the store
     * @param [selector] An optional selector function to apply to the state
     * @returns The state value or the result of applying the selector function
     */
    const get: GetState<T> = (selector?: (state: T) => T) => {
        if (selector instanceof Function) {
            return selector(state)
        } else {
            return state
        }
    }
    /**
     * @description Sets the state of the store
     * @param set The new state value or a function that takes the previous state and returns the new state value
     */
    const set: SetState<T> = (set) => {
        state = set instanceof Function ? set(state) : set;
        subscriptions.forEach(listener => listener(state))
        return state
    }

    /**
     * @description Selects a portion of the state and reacts to changes in that portion
     * @param [selector] An optional selector function to apply to the state
     * @param [equals] An optional equality function to use for comparing state values
     * @returns The selected state value or the result of applying the selector function
     */
    const use: UseState<T> = (selector?: (state: T) => T, equals?: (a: any, b: any) => boolean) => {
        const snapshot = equals ? () => get(useEqual<T, T>(selector, equals)) : () => get(selector)
        return React.useSyncExternalStore<T>(subscribe, snapshot);
    }

    /**
     * @description Subscribes a function to the store for non React side effects
     * @param [listener] An optional selector function to apply to the state
     * @returns A function that unsubsribes the listener
     */
    const subscribe: Subscribe<T> = (listener: (state?: T) => void) => {
        subscriptions.add(listener);
        return () => {
            subscriptions.delete(listener);
        };
    }

    const store = { get, set, use, subscribe }

    // let state = initializeState instanceof Function ? initializeState(store) : initialState;
    let state= initialState

    const initializedMutations = mutations ? mutations(store) : null as Omit<M, keyof Store<T>>

    return { ...initializedMutations, ...store }
}




export function useEqual<S, U>(selector: (state: S) => U, equals: (a: any, b: any) => boolean): (state: S) => U {
    const prev = React.useRef<U>()

    return (state) => {
        const next = selector(state)
        return equals(prev.current, next)
            ? (prev.current as U)
            : (prev.current = next)
    }
}




