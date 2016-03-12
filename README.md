# object-invariant-test-helper

A module that is useful for testing whether you've mutated an object. Use it with [redux](http://redux.js.org/ 'redux.js.org') when testing your reducers to ensure you don't ever mutate an object in a reducer but always return a new object.

This module began life as a fork of [redux-immutable-state-invariant](https://github.com/leoasis/redux-immutable-state-invariant 'GitHub: redux-immutable-state-invariant') by [Leonardo Andres Garcia Crespo (@leoasis)](https://github.com/leoasis 'GitHub: @leoasis').

## Setup

This lib is intended for use only during development, specifically testing.

**Don't use this in production!**

```js
npm install --save-dev object-invariant-test-helper
```

## Usage


```js
import objectInvariantTestHelper from '../src/index';

const toAdd = 2;
const expectedState = {num: 3};

describe('goodReducer', () => {
  it('should *not* mutate state', () => {
    let initialState = {num: 1};
    const tracked = objectInvariantTestHelper.trackObj(initialState);

    let finalState = goodReducer(initialState, {
      type: 'ADD',
      payload: { toAdd }
    });

    expect(finalState).toEqual(expectedState);
    expect(objectInvariantTestHelper.hasMutated(tracked)).toEqual(false);
  });
});
```

If you want to provide your own `isImmutable` function, you may:

```js
import { objectInvariantTestHelperMkr } from '../src/index';
let objectInvariantTestHelper = objectInvariantTestHelperMkr(isImmutable);
```
