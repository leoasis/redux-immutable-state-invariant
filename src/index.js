import isImmutableDefault from './isImmutable';
import trackForMutations from './trackForMutations';

export default function stateInvariantTestHelper(isImmutable = isImmutableDefault) {
  return {
    trackObj: (obj) => { return trackForMutations(isImmutable, obj); },
    hasMutated: (tracked) => { return tracked.detectMutations().wasMutated; }
  };
}
