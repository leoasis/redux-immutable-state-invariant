import expect from 'expect';
import isImmutable from '../src/isImmutable';
import copyState from '../src/copyState';
import wasMutated from '../src/wasMutated';

describe('wasMutated', () => {
  let state;

  function testCasesForMutation(mutation) {
    it('returns true and the mutated path', () => {
      const copiedPrevState = copyState(state, isImmutable);
      const newState = mutation.fn(state);

      expect(
        wasMutated(state, copiedPrevState, newState, isImmutable)
      ).toEqual({wasMutated: true, path: mutation.path});
    });
  }

  function testCasesForNonMutation(nonMutation) {
    it('returns false', () => {
      const copiedPrevState = copyState(state, isImmutable);
      const newState = nonMutation(state);

      expect(
        wasMutated(state, copiedPrevState, newState, isImmutable)
      ).toEqual({wasMutated: false});
    });
  }

  beforeEach(() => {
    state = {foo: {bar: [2, 3, 4], baz: 'baz'}};
  });

  const mutations = {
    'mutating nested array': {
      fn: (s) => {
        s.foo.bar.push(5);
        return s;
      },
      path: ['foo', 'bar', '3']
    },
    'mutating nested array and setting new root object': {
      fn: (s) => {
        s.foo.bar.push(5);
        return {...s};
      },
      path: ['foo', 'bar', '3']
    },
    'changing nested string': {
      fn: (s) => {
        s.foo.baz = 'changed!';
        return s;
      },
      path: ['foo', 'baz']
    },
    'removing nested state': {
      fn: (s) => {
        delete s.foo;
        return s;
      },
      path: ['foo']
    }
  };

  Object.keys(mutations).forEach((mutationDesc) => {
    describe(`mutating state by ${mutationDesc}`, () => {
      testCasesForMutation(mutations[mutationDesc]);
    });
  });

  const nonMutations = {
    'returning same state': (s) => s,
    'returning a new state object with nested new string': (s) => {
      return {...s, foo: {...s.foo, baz: 'changed!'}};
    },
    'returning a new state object with nested new array': (s) => {
      return {...s, foo: {...s.foo, bar: [...s.foo.bar, 5]}};
    },
    'removing nested state': (s) => {
      return {...s, foo: {}};
    }
  };

  Object.keys(nonMutations).forEach((nonMutationDesc) => {
    describe(`not mutating state by ${nonMutationDesc}`, () => {
      testCasesForNonMutation(nonMutations[nonMutationDesc]);
    });
  });
});
