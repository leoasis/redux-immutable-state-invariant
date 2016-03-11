import expect from 'expect';
import stateInvariantTestHelperMkr from '../src/index';
let stateInvariantTestHelper = stateInvariantTestHelperMkr();

/* global describe, it */

function badReducer(state = {num: 0}, action) {
  switch(action.type) {
    case 'ADD':
      let { toAdd } = action.payload
      state.num += toAdd;
      return state;
    default:
      return state;
  }
}

function goodReducer (state = {num: 0}, action) {
  switch(action.type) {
    case 'ADD':
      let { num } = state;
      let { toAdd } = action.payload;
      return Object.assign({}, state, {num: num + toAdd})
    default:
      return state;
  }
}

const toAdd = 2;
const expectedState = {num: 3};

describe('badReducer', () => {
  it('should mutate state', () => {
    let initialState = {num: 1};
    const tracked = stateInvariantTestHelper.trackObj(initialState);

    let finalState = badReducer(initialState, {
      type: 'ADD',
      payload: { toAdd }
    });

    expect(finalState).toEqual(expectedState);
    expect(stateInvariantTestHelper.hasMutated(tracked)).toEqual(true);
  });
});

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
