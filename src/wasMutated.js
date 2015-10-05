import any from 'lodash/collection/any';

export default function wasMutated(stateRef, state, isImmutable, path = []) {
  if (isImmutable(stateRef) || isImmutable(state)) {
    if (stateRef !== state) {
      return { wasMutated: true, path };
    } else {
      return { wasMutated: false };
    }
  }

  const keys = {};
  Object.keys(stateRef).forEach(key => {
    keys[key] = true;
  });
  Object.keys(state).forEach(key => {
    keys[key] = true;
  });

  for (let key of Object.keys(keys)) {
    const result = wasMutated(stateRef[key], state[key], isImmutable, path.concat(key));
    if (result.wasMutated) {
      return result;
    }
  }
  return { wasMutated: false };
}
