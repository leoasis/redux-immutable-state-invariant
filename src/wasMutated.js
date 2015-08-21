import any from 'lodash/collection/any';

export default function wasMutated(prevStateRef, prevState, state, isImmutable, sameParentRef = true) {
  if (prevState == null || state == null || isImmutable(prevState)) {
    if (sameParentRef) {
      return prevState !== state;
    }

    return false;
  }

  const sameRef = prevStateRef === state;

  // Gather all keys from prev and after states
  const keys = {};
  Object.keys(prevState).forEach(key => {
    keys[key] = true;
  });
  Object.keys(state).forEach(key => {
    keys[key] = true;
  });

  return any(Object.keys(keys), key =>
    wasMutated(prevStateRef[key], prevState[key], state[key], isImmutable, sameRef)
  );
}
