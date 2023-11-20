/*
Inspired by Zustand
Simplified for use with React 18 only and some personal preferences
*/

import React from 'react'

interface SetState<T> {
    (set: T | ((prev: T) => T)): T
}

interface MergeState<T> {
    (merge: Partial<T> | ((prev: T) => Partial<T>)): T
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

interface Store<T> {
    set: SetState<T>
    get: GetState<T>
    merge: MergeState<T>
    use: UseState<T>
}

type Mutations<T> = { [k: string]: any } & { [K in keyof Store<T>]?: never }

/**
 * Creates a store that manages state and provides methods for setting, getting, and merging state values.
 * @template T The type of the store state
 * @param initialState The initial state of the store
 * @param  [mutations] An optional function that defines custom mutations for the store.
 * @param  [initializeState] An optional function that initializes the state of the store.
 * @returns The store object, which includes the set, get, merge, and use methods, along with any custom mutations defined by the mutations parameter.
 * @example
 * const booleanStore = createStore(
 * false,
 * ({set})=>{
 *  toggle: ()=>set(prev=>!prev)
 * })
 */
export function createStore<T, M extends Mutations<T> = Mutations<T>>(
    initialState: T,
    mutations?: (store: Store<T>) => M,
    initializeState?: (store: Store<T>) => T
) {
    const subscriptions = new Set<() => void>();

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
        subscriptions.forEach(listener => listener())
        return state
    }

    /**
     * @description Merges the state of the store with a new object or a function that takes the previous state and returns an object to merge
     * @param merge The object to merge or a function that takes the previous state and returns an object to merge
     */
    const merge: MergeState<T> = (merge) => {
        const newState = merge instanceof Function ? merge(state) : merge;
        state = { ...state, ...newState }
        subscriptions.forEach(listener => listener())
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

    function subscribe(listener: () => void) {
        subscriptions.add(listener);
        return () => {
            subscriptions.delete(listener);
        };
    }
    const store = { get, set, merge, use, subscribe }

    let state = initializeState instanceof Function ? initializeState(store) : initialState;

    const initializedMutations = mutations ? mutations(store) : null as Omit<M, keyof Store<T>>

    return { ...initializedMutations, ...store }
}





export function useEqual<S, U>(selector: (state: S) => U, equals: (a: any, b: any) => boolean = shallowEqual): (state: S) => U {
    const prev = React.useRef<U>()

    return (state) => {
        const next = selector(state)
        return equals(prev.current, next)
            ? (prev.current as U)
            : (prev.current = next)
    }
}

/**
 * Checks if two values are equal using JSON stringification
 * @param  a The first value to compare
 * @param  b The second value to compare
 * @returns  True if the values are equal, false otherwise
 */
export function jsonEqual<T>(a: T, b: T) {
    return (JSON.stringify(a) === JSON.stringify(b))
}

/**
 * Checks if two values are equal using JSON stringification
 * @param  a The first value to compare
 * @param  b The second value to compare
 * @returns  True if the values are equal, false otherwise
 */
export function shallowEqual<T>(a: T, b: T) {
    if (Object.is(a, b)) {
        return true
    }
    if (
        typeof a !== 'object' ||
        a === null ||
        typeof b !== 'object' ||
        b === null
    ) {
        return false
    }

    if (a instanceof Map && b instanceof Map) {
        if (a.size !== b.size) return false

        for (const [key, value] of a) {
            if (!Object.is(value, b.get(key))) {
                return false
            }
        }
        return true
    }

    if (a instanceof Set && b instanceof Set) {
        if (a.size !== b.size) return false

        for (const value of a) {
            if (!b.has(value)) {
                return false
            }
        }
        return true
    }

    const keysA = Object.keys(a)
    if (keysA.length !== Object.keys(b).length) {
        return false
    }
    for (let i = 0; i < keysA.length; i++) {
        if (
            !Object.prototype.hasOwnProperty.call(b, keysA[i] as string) ||
            !Object.is(a[keysA[i] as keyof T], b[keysA[i] as keyof T])
        ) {
            return false
        }
    }
    return true
}


export function useLocalStore<T>(initialState: T | (() => T)) {
    const [state, setState] = React.useState(initialState)

    return {
        state,
        set: setState,
        get: () => state,
        use: () => state,
        merge: (obj: Partial<T>) => { setState(prev => ({ ...prev, ...obj })) }
    }
}