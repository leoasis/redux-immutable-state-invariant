import isImmutableDefault from './isImmutable';
import trackForMutations from './trackForMutations';

export function objectInvariantTestHelperMkr(isImmutable = isImmutableDefault) {
  return {
    trackObj: (obj) => { return trackForMutations(isImmutable, obj); },
    hasMutated: (tracked) => { return tracked.detectMutations().wasMutated; }
  };
}

let objectInvariantTestHelper = objectInvariantTestHelperMkr(isImmutableDefault);

export default objectInvariantTestHelper;
