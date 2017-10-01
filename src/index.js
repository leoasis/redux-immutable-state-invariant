import invariant from 'invariant';
import stringify from 'json-stringify-safe';
import isImmutableDefault from './isImmutable';
import trackForMutations from './trackForMutations';

const BETWEEN_DISPATCHES_MESSAGE = [
  'A state mutation was detected between dispatches, in the path `%s`.',
  'This may cause incorrect behavior.',
  '(http://redux.js.org/docs/Troubleshooting.html#never-mutate-reducer-arguments)'
].join(' ');

const INSIDE_DISPATCH_MESSAGE = [
  'A state mutation was detected inside a dispatch, in the path: `%s`.',
  'Take a look at the reducer(s) handling the action %s.',
  '(http://redux.js.org/docs/Troubleshooting.html#never-mutate-reducer-arguments)'
].join(' ');

export default function immutableStateInvariantMiddleware(options = {}) {
  const {
    isImmutable = isImmutableDefault,
    ignore,
    logToConsoleOnly
  } = options
  const track = trackForMutations.bind(null, isImmutable, ignore);

  return ({getState}) => {
    let state = getState();
    let tracker = track(state);

    let result;
    return (next) => (action) => {
      state = getState();

      result = tracker.detectMutations();
      // Track before potentially not meeting the invariant
      tracker = track(state);

      if (logToConsoleOnly) {
        result.wasMutated && console.error(
          BETWEEN_DISPATCHES_MESSAGE,
          (result.path || []).join('.')
        );
      } else {
        invariant(
          !result.wasMutated,
          BETWEEN_DISPATCHES_MESSAGE,
          (result.path || []).join('.')
        );
      }

      const dispatchedAction = next(action);
      state = getState();

      result = tracker.detectMutations();
      // Track before potentially not meeting the invariant
      tracker = track(state);
      
      if (logToConsoleOnly) {
        result.wasMutated && console.error(
          INSIDE_DISPATCH_MESSAGE,
          (result.path || []).join('.'),
          stringify(action)
        );
      } else {
        invariant(
          !result.wasMutated,
          INSIDE_DISPATCH_MESSAGE,
          (result.path || []).join('.'),
          stringify(action)
        );
      }

      return dispatchedAction;
    };
  };
}
