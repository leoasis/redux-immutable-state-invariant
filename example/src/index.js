const {createStore, applyMiddleware} = require('redux');
const immutableStateInvariant = require('redux-immutable-state-invariant');

const createStoreWithMiddleware = applyMiddleware(immutableStateInvariant())(createStore);

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

const store = createStoreWithMiddleware(reducer);

store.dispatch({type: 'ARRAY_MUTATION', element: {a:1, b:2}});
