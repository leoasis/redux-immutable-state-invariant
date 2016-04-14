# redux-immutable-state-invariant

[![Build Status](https://travis-ci.org/leoasis/redux-immutable-state-invariant.png)](https://travis-ci.org/leoasis/redux-immutable-state-invariant)

Redux middleware that spits an error on you when you try to mutate your state either inside a dispatch or between dispatches. **For development use only!**

## Why?

Because [you're not allowed to mutate your state in your reducers](http://redux.js.org/docs/Troubleshooting.html#never-mutate-reducer-arguments)!. And by extension, you shouldn't mutate them either outside. In order to change state in your app, you should always return a new instance of your state with the changes.

If you're using a library such as `Immutable.js`, this is automatically done for you since the structures provided by that library don't allow you to mutate them (as long as you don't have mutable stuff as values in those collections). However, if you're using regular objects and arrays, you should be careful to avoid mutations.

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
const reducer = require('./reducers/index');

// Be sure to ONLY add this middleware in development!
const middleware = process.env.NODE_ENV !== 'production' ?
  [require('redux-immutable-state-invariant')(), thunk] :
  [thunk];

// Note passing middleware as the last argument to createStore requires redux@>=3.1.0
const store = createStore(
  reducer,
  applyMiddleware(...middleware)
);
```

Then if you're doing things correctly, you should see nothing different. But if you don't, that is, if you're mutating your data somewhere in your app either in a dispatch or between dispatches, an error will be thrown with a (hopefully) descriptive message.
