# redux-immutable-state-invariant

Redux middleware that spits an error on you when you try to mutate your state either inside a dispatch or between dispatches. **For development use only!**

## How to install

This lib is intended to use only during development. **Don't use this in production!**

```js
npm install --save-dev redux-immutable-state-invariant
```

## How to use

As said above, **don't use this in production!** It involves a lot of object copying and will degrade your app's performance. This is intended to be a tool to aid you in development and help you catch bugs.

To use it, just add it as a middleware in your redux store:

```js
const {applyMiddleware, combineReducers, createStore} = require('redux');
const thunk = require('redux-thunk');
const reducers = require('./reducers');

const reducer = combineReducers(reducers);

// Be sure to ONLY add this middleware in development!
const middleware = process.env.NODE_ENV !== 'production' ?
  [require('redux-immutable-state-invariant'), thunk] :
  [thunk];
const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
const store = createStoreWithMiddleware(reducer);
```

Then if you're doing things correctly, you should see nothing different. But if you don't, that is, if you're mutating your data somewhere in your app either in a dispatch or between dispatches, an error will be thrown with a (hopefully) descriptive message.
