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
import { stateInvariantTestHelperMkr } from 'object-invariant-test-helper';
let stateInvariantTestHelper = stateInvariantTestHelperMkr();

const toAdd = 2;
const expectedState = {num: 3};

describe('goodReducer', () => {
  it('should *not* mutate state', () => {
    let initialState = {num: 1};
    const tracked = stateInvariantTestHelper.trackObj(initialState);

    let finalState = goodReducer(initialState, {
      type: 'ADD',
      payload: { toAdd }
    });

    expect(finalState).toEqual(expectedState);
    expect(stateInvariantTestHelper.hasMutated(tracked)).toEqual(false);
  });
});
```
