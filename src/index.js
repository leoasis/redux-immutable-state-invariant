import invariant from 'invariant';
import cloneDeep from 'lodash/lang/cloneDeep';
import wasMutated from './wasMutated';

function isImmutableDefault(value) {
  return typeof value !== 'object';
}

function copyState(state, isImmutable) {
  return cloneDeep(state, value => {
    if (isImmutable(value)) {
      return value;
    }
  });
}

const BETWEEN_DISPATCHES_MESSAGE = [
  'A state mutation was detected between dispatches.',
  ' This may cause incorrect behavior.',
  '(https://github.com/gaearon/redux#my-views-arent-updating)'
].join('');

const INSIDE_DISPATCH_MESSAGE = [
  'A state mutation was detected inside a dispatch.',
  ' Take a look at the store(s) handling the action %s.',
  '(https://github.com/gaearon/redux#my-views-arent-updating)'
].join('');

export default function immutableStateInvariantMiddleware(isImmutable = isImmutableDefault) {
  return ({getState}) => {
    let lastStateRef = getState();
    let lastStateCopy = copyState(lastStateRef, isImmutable);

    return (next) => (action) => {
      const stateRef = getState();

      invariant(
        !wasMutated(lastStateRef, lastStateCopy, stateRef, isImmutable),
        BETWEEN_DISPATCHES_MESSAGE
      );

      const stateCopy = copyState(stateRef, isImmutable);
      const dispatchedAction = next(action);
      lastStateRef = getState();

      invariant(
        !wasMutated(stateRef, stateCopy, lastStateRef, isImmutable),
        INSIDE_DISPATCH_MESSAGE,
        action.type
      );

      lastStateCopy = copyState(lastStateRef, isImmutable);
      return dispatchedAction;
    };
  };
}
