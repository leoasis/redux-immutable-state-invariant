import any from 'lodash/collection/any';

export default function wasMutated(prevStateRef, prevState, state, isImmutable, sameParentRef = false, path = []) {
  if (prevState == null || state == null || isImmutable(prevState)) {
    if (sameParentRef) {
      return { wasMutated: prevState !== state, path };
    }

    return { wasMutated: false };
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

  for (let key of Object.keys(keys)) {
    const result = wasMutated(prevStateRef[key], prevState[key], state[key], isImmutable, sameRef, path.concat(key));
    if (result.wasMutated) {
      return result;
    }
  }
  return { wasMutated: false };
}
