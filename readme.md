# React Store

Global state for React 18 that allows components or any listener to individually subscribe to any part of the state.

## Description

This library provides a lightweight state management solution for React applications. It offers a simple Store class for managing application state and a useEqual hook for optimizing updates based on custom comparison logic.

## Getting Started

### Dependencies

- React v18

### Installing

```
npx jsr add @kling/react-store
```

### Usage

```tsx
import { Store } from "@kling/react-store";

const personStore = new Store({
  firstName: "",
  lastName: "",
});

//You can use the set function anywhere in your app
function resetName() {
  personStore.set({
    firstName: "",
    lastName: "",
  });
}

//This component rerenders on all changes to personStore
function App() {
  const person = personStore.use();

  return;
  <div>
    {person.firstName}
    <LastName />
    <input
      value={person.firstName}
      onChange={(e) => {
        personStore.set((prev) => ({ ...prev, firstName: e.target.value }));
      }}
    />
    <SetNameButton />
  </div>;
}

//Seperate Component. Only rerenders on changes to lastName
function LastName() {
  const lastName = personStore.use((p) => p.lastName);

  return <div>{lastName}</div>;
}

//Does not subscribe, will not rerender on state changes
function SetNameButton() {
  return <button onClick={()=>resetName()}>Reset</button>
}




```

### Notes

- If you want to store a function, set state must use the function method. Otherwise it will call your function and store its return value as the new state.
- Works well with immer for lots of deeply nested state changes if desired

```ts
import { createStore } from "@kling/react-store";

const functionStore = createStore(() => console.log("initial function"));

functionStore.set(() => () => console.log("second function"));
```

## Acknowledgments

I was inspired much by Zustand, but I wanted a different way to interact with the store. Add keep set actions outside the rendering cycle.

- [Zustand](https://github.com/pmndrs/zustand/tree/main)
