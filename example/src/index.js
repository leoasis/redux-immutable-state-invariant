const {createStore, applyMiddleware} = require('redux');
const { default: immutableStateInvariant } = require('redux-immutable-state-invariant');

const initialState = {
  stuff: []
};

function reducer(state = initialState, action) {
  switch(action.type) {
    case 'ARRAY_MUTATION':
      state.stuff.push(action.element);
      return state;
    default:
      return state;
  }
}

const store = createStore(
  reducer,
  applyMiddleware(immutableStateInvariant())
);

store.dispatch({type: 'ARRAY_MUTATION', element: {a:1, b:2}});
