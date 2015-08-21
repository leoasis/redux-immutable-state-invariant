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
  ' This may cause incorrect behavior. ',
  '(http://rackt.github.io/redux/docs/Troubleshooting.html#never-mutate-reducer-arguments)'
].join('');

const INSIDE_DISPATCH_MESSAGE = [
  'A state mutation was detected inside a dispatch.',
  ' Take a look at the reducer(s) handling the action %s. ',
  '(http://rackt.github.io/redux/docs/Troubleshooting.html#never-mutate-reducer-arguments)'
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
        action.type || action
      );

      lastStateCopy = copyState(lastStateRef, isImmutable);
      return dispatchedAction;
    };
  };
}
