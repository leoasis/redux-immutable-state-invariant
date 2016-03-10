import isImmutableDefault from './isImmutable';
import trackForMutations from './trackForMutations';

export default trackForMutations.bind(null, isImmutable);

export { trackForMutations, isImmutableDefault };
