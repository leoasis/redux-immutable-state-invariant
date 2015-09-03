import invariant from 'invariant';
import isImmutableDefault from './isImmutable';
import copyState from './copyState';
import wasMutated from './wasMutated';

const BETWEEN_DISPATCHES_MESSAGE = [
  'A state mutation was detected between dispatches, in the path `%s`.',
  'This may cause incorrect behavior.',
  '(http://rackt.github.io/redux/docs/Troubleshooting.html#never-mutate-reducer-arguments)'
].join(' ');

const INSIDE_DISPATCH_MESSAGE = [
  'A state mutation was detected inside a dispatch, in the path: `%s`.',
  'Take a look at the reducer(s) handling the action %s.',
  '(http://rackt.github.io/redux/docs/Troubleshooting.html#never-mutate-reducer-arguments)'
].join(' ');

export default function immutableStateInvariantMiddleware(isImmutable = isImmutableDefault) {
  return ({getState}) => {
    let lastStateRef = getState();
    let lastStateCopy = copyState(lastStateRef, isImmutable);

    let result;
    return (next) => (action) => {
      const stateRef = getState();

      result = wasMutated(lastStateRef, lastStateCopy, stateRef, isImmutable);
      invariant(
        !result.wasMutated,
        BETWEEN_DISPATCHES_MESSAGE,
        (result.path || []).join('.')
      );

      const stateCopy = copyState(stateRef, isImmutable);
      const dispatchedAction = next(action);
      lastStateRef = getState();

      result = wasMutated(stateRef, stateCopy, lastStateRef, isImmutable);
      invariant(
        !result.wasMutated,
        INSIDE_DISPATCH_MESSAGE,
        (result.path || []).join('.'),
        action.type || action
      );

      lastStateCopy = copyState(lastStateRef, isImmutable);
      return dispatchedAction;
    };
  };
}
