import expect from 'expect';
import isImmutableDefault from '../src/isImmutable';
import trackForMutations from '../src/trackForMutations';

describe('trackForMutations', () => {
  function testCasesForMutation(spec) {
    it('returns true and the mutated path', () => {
      const state = spec.getState();
      const options = spec.middlewareOptions || {};
      const { isImmutable = isImmutableDefault, ignore } = options;
      const tracker = trackForMutations(isImmutable, ignore, state);
      const newState = spec.fn(state);

      expect(
        tracker.detectMutations()
      ).toEqual({ wasMutated: true, path: spec.path });
    });
  }

  function testCasesForNonMutation(spec) {
    it('returns false', () => {
      const state = spec.getState();
      const options = spec.middlewareOptions || {};
      const { isImmutable = isImmutableDefault, ignore } = options;
      const tracker = trackForMutations(isImmutable, ignore, state);
      const newState = spec.fn(state);

      expect(
        tracker.detectMutations()
      ).toEqual({ wasMutated: false });
    });
  }

  const mockObj = {};
  const mockFn = () => {};
  const mutations = {
    'adding to nested array': {
      getState: () => ({
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
      getState: () => ({
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
      getState: () => ({
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
      getState: () => ({
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
      getState: () => ({
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
      path: ['stuff', '0']
    },
    'adding object to array': {
      getState: () => ({
        stuff: []
      }),
      fn: (s) => {
        s.stuff.push({foo: 1, bar: 2});
        return s;
      },
      path: ['stuff', '0']
    },
    'mutating previous state and returning new state': {
      getState: () => ({ counter: 0 }),
      fn: (s) => {
        s.mutation = true;
        return { ...s, counter: s.counter + 1 };
      },
      path: ['mutation']
    },
    'mutating previous state with non immutable type and returning new state': {
      getState: () => ({ counter: 0 }),
      fn: (s) => {
        s.mutation = [1, 2, 3];
        return { ...s, counter: s.counter + 1 };
      },
      path: ['mutation']
    },
    'mutating previous state with non immutable type and returning new state without that property': {
      getState: () => ({ counter: 0 }),
      fn: (s) => {
        s.mutation = [1, 2, 3];
        return { counter: s.counter + 1 };
      },
      path: ['mutation']
    },
    'mutating previous state with non immutable type and returning new simple state': {
      getState: () => ({ counter: 0 }),
      fn: (s) => {
        s.mutation = [1, 2, 3];
        return 1;
      },
      path: ['mutation']
    },
    'mutating previous state by deleting property and returning new state without that property': {
      getState: () => ({ counter: 0, toBeDeleted: true }),
      fn: (s) => {
        delete s.toBeDeleted;
        return { counter: s.counter + 1 };
      },
      path: ['toBeDeleted']
    },
    'mutating previous state by deleting nested property': {
      getState: () => ({ nested: { counter: 0, toBeDeleted: true }, foo: 1 }),
      fn: (s) => {
        delete s.nested.toBeDeleted;
        return { nested: { counter: s.counter + 1 } };
      },
      path: ['nested', 'toBeDeleted']
    },
    'update reference': {
      getState: () => ({ foo: {} }),
      fn: (s) => {
        s.foo = {};
        return s;
      },
      path: ['foo']
    },
    'cannot ignore root state': {
      getState: () => ({ foo: {} }),
      fn: (s) => {
        s.foo = {};
        return s;
      },
      middlewareOptions: {
        ignore: ['']
      },
      path: ['foo']
    },
    'catching state mutation in non-ignored branch': {
      getState: () => ({
        foo: {
          bar: [1, 2]
        },
        boo: {
          yah: [1, 2]
        }
      }),
      fn: (s) => {
        s.foo.bar.push(3);
        s.boo.yah.push(3);
        return s;
      },
      middlewareOptions: {
        ignore: ['foo']
      },
      path: ['boo', 'yah', '2']
    },
    'setting value on Map': {
      getState: () => {
        const map = new Map();
        map.set('bar', 9000)
        return { foo: map };
      },
      fn: (s) => {
        s.foo.set('bar', 9001)
        return s;
      },
      path: ['foo', 'bar']
    },
    'deleting value on Map': {
      getState: () => {
        const map = new Map();
        map.set('bar', 9000)
        map.set('baz', 9001)
        return { foo: map };
      },
      fn: (s) => {
        s.foo.delete('bar')
        return s;
      },
      path: ['foo', 'bar']
    },
    'clearing values on Map': {
      getState: () => {
        const map = new Map();
        map.set('bar', 9000)
        map.set('baz', 9001)
        return { foo: map };
      },
      fn: (s) => {
        s.foo.clear()
        return s;
      },
      path: ['foo', 'bar']
    },
    'changing value of Map keyed by number': {
      getState: () => {
        return new Map()
          .set(5, 9000)
          .set(6, 9001);
      },
      fn: (s) => {
        s.set(5, 9002)
        return s;
      },
      path: [5]
    },
    'changing value of Map keyed by function': {
      getState: () => {
        return new Map().set(mockFn, 9000)
      },
      fn: (s) => {
        s.set(mockFn, 9001)
        return s;
      },
      path: [mockFn]
    },
    'changing value of Map keyed by Object': {
      getState: () => {
        return new Map().set(mockObj, 9000)
      },
      fn: (s) => {
        s.set(mockObj, 9001)
        return s;
      },
      path: [mockObj]
    },
    'adding to Set': {
      getState: () => {
        const set = new Set([2, 3, 4]);
        return { foo: set };
      },
      fn: (s) => {
        s.foo.add(5);
        return s;
      },
      path: ['foo', '3']
    },
    'deleting value in Set': {
      getState: () => {
        const set = new Set([2, 3, 4]);
        return { foo: set };
      },
      fn: (s) => {
        s.foo.delete(3);
        return s;
      },
      path: ['foo', '1']
    },
    'clearing values in Set': {
      getState: () => {
        const set = new Set([2, 3, 4]);
        return { foo: set };
      },
      fn: (s) => {
        s.foo.clear();
        return s;
      },
      path: ['foo', '0']
    },
  };

  Object.keys(mutations).forEach((mutationDesc) => {
    describe(mutationDesc, () => {
      testCasesForMutation(mutations[mutationDesc]);
    });
  });

  const nonMutations = {
    'not doing anything': {
      getState: () => ({ a:1, b:2 }),
      fn: (s) => s
    },
    'from undefined to something': {
      getState: () => undefined,
      fn: (s) => ({foo: 'bar'})
    },
    'returning same state': {
      getState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => s
    },
    'returning a new state object with nested new string': {
      getState: () => ({
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
      getState: () => ({
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
      getState: () => ({
        foo: {
          bar: [2, 3, 4],
          baz: 'baz'
        },
        stuff: []
      }),
      fn: (s) => {
        return {...s, foo: {}};
      }
    },
    'having a NaN in the state': {
      getState: () => ({ a:NaN, b: Number.NaN }),
      fn: (s) => s
    },
    'ignoring branches from mutation detection': {
      getState: () => ({
        foo: {
          bar: 'bar'
        },
      }),
      fn: (s) => {
        s.foo.bar = 'baz'
        return s;
      },
      middlewareOptions: {
        ignore: ['foo']
      },
    },
    'ignoring nested branches from mutation detection': {
      getState: () => ({
        foo: {
          bar: [1, 2],
          boo: {
            yah: [1, 2]
          }
        },
      }),
      fn: (s) => {
        s.foo.bar.push(3);
        s.foo.boo.yah.push(3);
        return s;
      },
      middlewareOptions: {
        ignore: [
          'foo.bar',
          'foo.boo.yah',
        ]
      }
    },
    'ignoring nested array indices from mutation detection': {
      getState: () => ({
        stuff: [{a: 1}, {a: 2}]
      }),
      fn: (s) => {
        s.stuff[1].a = 3
        return s;
      },
      middlewareOptions: {
        ignore: ['stuff.1']
      }
    },
    'ignoring nested values of a Map': {
      getState: () => new Map().set('foo', 'bar'),
      fn: (s) => {
        s.clear()
        return s;
      },
      middlewareOptions: {
        ignore: ['foo']
      }
    },
    'ignoring nested values of a Set': {
      getState: () => new Set().add('foo').add('bar'),
      fn: (s) => {
        s.delete('foo');
        return s;
      },
      middlewareOptions: {
        ignore: ['0', '1']
      }
    }
  };

  Object.keys(nonMutations).forEach((nonMutationDesc) => {
    describe(nonMutationDesc, () => {
      testCasesForNonMutation(nonMutations[nonMutationDesc]);
    });
  });
});
