import expect from 'expect';
import isImmutable from '../src/isImmutable';
import copyState from '../src/copyState';
import wasMutated from '../src/wasMutated';

describe('wasMutated', () => {
  function testCasesForMutation(spec) {
    it('returns true and the mutated path', () => {
      const state = spec.prevState();
      const copiedPrevState = copyState(state, isImmutable);
      const newState = spec.fn(state);

      expect(
        wasMutated(state, copiedPrevState, newState, isImmutable)
      ).toEqual({wasMutated: true, path: spec.path});
    });
  }

  function testCasesForNonMutation(spec) {
    it('returns false', () => {
      const state = spec.prevState();
      const copiedPrevState = copyState(state, isImmutable);
      const newState = spec.fn(state);

      expect(
        wasMutated(state, copiedPrevState, newState, isImmutable)
      ).toEqual({wasMutated: false});
    });
  }

  const mutations = {
    'adding to nested array': {
      prevState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => {
        s.foo.bar.push(5);
        return s;
      },
      path: ['foo', 'bar', '3']
    },
    'adding to nested array and setting new root object': {
      prevState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => {
        s.foo.bar.push(5);
        return {...s};
      },
      path: ['foo', 'bar', '3']
    },
    'changing nested string': {
      prevState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => {
        s.foo.baz = 'changed!';
        return s;
      },
      path: ['foo', 'baz']
    },
    'removing nested state': {
      prevState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => {
        delete s.foo;
        return s;
      },
      path: ['foo']
    },
    'adding to array': {
      prevState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => {
        s.stuff.push(1);
        return s;
      },
      path: ['stuff', 0]
    },
    'adding object to array': {
      prevState: () => ({
        stuff: []
      }),
      fn: (s) => {
        s.stuff.push({foo: 1, bar: 2});
        return s;
      },
      path: ['stuff', 0]
    }
  };

  Object.keys(mutations).forEach((mutationDesc) => {
    describe(`mutating state by ${mutationDesc}`, () => {
      testCasesForMutation(mutations[mutationDesc]);
    });
  });

  const nonMutations = {
    'from undefined to something': {
      prevState: () => undefined,
      fn: (s) => ({foo: 'bar'})
    },
    'returning same state': {
      prevState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => s
    },
    'returning a new state object with nested new string': {
      prevState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => {
        return {...s, foo: {...s.foo, baz: 'changed!'}};
      }
    },
    'returning a new state object with nested new array': {
      prevState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => {
        return {...s, foo: {...s.foo, bar: [...s.foo.bar, 5]}};
      }
    },
    'removing nested state': {
      prevState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => {
        return {...s, foo: {}};
      }
    }
  };

  Object.keys(nonMutations).forEach((nonMutationDesc) => {
    describe(`not mutating state by ${nonMutationDesc}`, () => {
      testCasesForNonMutation(nonMutations[nonMutationDesc]);
    });
  });
});
