# React Store

Global state for react 18 that allows components or any listener to individually subscribe to any part of the state. 

## Description

An in-depth paragraph about your project and overview of use.

## Getting Started

### Dependencies

* React v18

### Installing

```
deno add @kling/react-store
```

```
import * as mod from "@kling/react-store";
```

### Usage


```
// personStore.ts

import {createStore} from '@kling/react-store'

const personStore = createStore({
    firstName: "",
    lastName: ""
})
```

### Notes

* If you want to store a function, set state must use the function method.

```

```




## License

This project is licensed under the [NAME HERE] License - see the LICENSE.md file for details

## Acknowledgments

I was inspired much by Zustand, but I wanted a different way to interact with the store.

* [Zustand](https://github.com/pmndrs/zustand/tree/main)
