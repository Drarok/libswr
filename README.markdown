# libSWR [![Node.js CI](https://github.com/Drarok/libswr/actions/workflows/nodejs.yml/badge.svg)](https://github.com/Drarok/libswr/actions/workflows/nodejs.yml)

A very simple implementation of stale-while-revalidate, but for your code rather than HTTP caches.

## Usage

```js
const swr = require('libswr');

// This example uses HTTP, but you can write any async code.
const myGetterFunction = swr(async () => {
	const res = await fetch('/path/to/data');
	return res.json();
}, 1000);

// Blocks until the cache is warmed
const initialValue = await myGetterFunction();

// Immediately resolves to the previous value.
const secondValue = await myGetterFunction();

// After at least 1000ms has elapsed...
sleep(1000);

// Immediately resolves to the previous value, but also calls the passed-in
// function to refresh the cache.
const thirdValue = await myGetterFunction();

// Immediately resolves to the previous value if the passed-in function hasn't
// resolved yet, or to the new value if it has.
const fourthValue = await myGetterFunction();
```
