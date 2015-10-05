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
        wasMutated(state, copiedPrevState, isImmutable)
      ).toEqual({wasMutated: true, path: spec.path});
    });
  }

  function testCasesForNonMutation(spec) {
    it('returns false', () => {
      const state = spec.prevState();
      const copiedPrevState = copyState(state, isImmutable);
      const newState = spec.fn(state);

      expect(
        wasMutated(state, copiedPrevState, isImmutable)
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
    },
    'mutating previous state and returning new state': {
      prevState: () => ({ counter: 0 }),
      fn: (s) => {
        s.mutation = true;
        return { ...s, counter: s.counter + 1 };
      },
      path: ['mutation']
    },
    'mutating previous state with non immutable type and returning new state': {
      prevState: () => ({ counter: 0 }),
      fn: (s) => {
        s.mutation = [1, 2, 3];
        return { ...s, counter: s.counter + 1 };
      },
      path: ['mutation']
    },
    'mutating previous state with non immutable type and returning new state without that property': {
      prevState: () => ({ counter: 0 }),
      fn: (s) => {
        s.mutation = [1, 2, 3];
        return { counter: s.counter + 1 };
      },
      path: ['mutation']
    },
    'mutating previous state with non immutable type and returning new simple state': {
      prevState: () => ({ counter: 0 }),
      fn: (s) => {
        s.mutation = [1, 2, 3];
        return 1;
      },
      path: ['mutation']
    },
    'mutating previous state by deleting property and returning new state without that property': {
      prevState: () => ({ counter: 0, toBeDeleted: true }),
      fn: (s) => {
        delete s.toBeDeleted;
        return { counter: s.counter + 1 };
      },
      path: ['toBeDeleted']
    },
    'mutating previous state by deleting nested property': {
      prevState: () => ({ nested: { counter: 0, toBeDeleted: true }, foo: 1 }),
      fn: (s) => {
        delete s.nested.toBeDeleted;
        return { nested: { counter: s.counter + 1 } };
      },
      path: ['nested', 'toBeDeleted']
    },
  };

  Object.keys(mutations).forEach((mutationDesc) => {
    describe(mutationDesc, () => {
      testCasesForMutation(mutations[mutationDesc]);
    });
  });

  const nonMutations = {
    'not doing anything': {
      prevState: () => ({ a:1, b:2 }),
      fn: (s) => s
    },
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
    describe(nonMutationDesc, () => {
      testCasesForNonMutation(nonMutations[nonMutationDesc]);
    });
  });
});
