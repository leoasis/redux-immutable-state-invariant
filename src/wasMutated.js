import any from 'lodash/collection/any';

export default function wasMutated(prevStateRef, prevState, state, isImmutable, sameParentRef = true) {
  if (isImmutable(prevState)) {
    if (sameParentRef) {
      return prevState !== state;
    }

    return false;
  }

  const sameRef = prevStateRef === state;

  return any(prevStateRef, (val, key) =>
    wasMutated(val, prevState[key], state[key], isImmutable, sameRef)
  );
}
