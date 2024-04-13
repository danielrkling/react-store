# React Store

Global state for react 18 that allows components or any listener to individually subscribe to any part of the state.

## Description

An in-depth paragraph about your project and overview of use.

## Getting Started

### Dependencies

- React v18

### Installing

```
npx jsr add @kling/react-store
```

```ts
import * as mod from "@kling/react-store";
```

### Usage

```tsx
import { createStore } from "@kling/react-store";

const personStore = createStore({
  firstName: "",
  lastName: "",
});

function App() {
  const person = personStore.use();

  return 
    <div>
      <PersonName />
      <input
        value={person.firstName}
        onChange={(e) => {
          personStore.set((prev) => ({ ...prev, firstName: e.target.value }));
        }}
      />
    </div>
  
}

function PersonName() {
  return (
    <div>
      {person.firstName}
      {person.lastName}
    </div>
  );
}
```

### Notes

- If you want to store a function, set state must use the function method.

```ts
import { createStore } from "@kling/react-store";

const functionStore = createStore(() => console.log("initial function"));

functionStore.set(() => () => console.log("second function"));
```


## Acknowledgments

I was inspired much by Zustand, but I wanted a different way to interact with the store.

- [Zustand](https://github.com/pmndrs/zustand/tree/main)
