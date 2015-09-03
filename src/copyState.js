import cloneDeep from 'lodash/lang/cloneDeep';

export default function copyState(state, isImmutable) {
  return cloneDeep(state, value => {
    if (isImmutable(value)) {
      return value;
    }
  });
}
