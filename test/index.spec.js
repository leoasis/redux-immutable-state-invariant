import expect from 'expect';
import warnMutationsMiddleware from '../src/index';

describe('middleware', () => {
  describe('warnMutationsMiddleware', () => {
    let state;
    const getState = () => state;

    function middleware(next) {
      return warnMutationsMiddleware()({getState})(next);
    }

    function testCasesForMutation(mutation) {
      it('should throw if happening inside the dispatch', () => {
        const next = action => {
          state = mutation(state);
          return action;
        };

        const dispatch = middleware(next);

        expect(() => {
          dispatch({type: 'SOME_ACTION'});
        }).toThrow();
      });

      it('should throw if happening between dispatches', () => {
        const next = action => action;

        const dispatch = middleware(next);

        dispatch({type: 'SOME_ACTION'});
        state = mutation(state);
        expect(() => {
          dispatch({type: 'SOME_OTHER_ACTION'});
        }).toThrow();
      });
    }

    function testCasesForNonMutation(nonMutation) {

      it('should not throw if happening inside the dispatch', () => {
        const next = action => {
          state = nonMutation(state);
          return action;
        };

        const dispatch = middleware(next);

        expect(() => {
          dispatch({type: 'SOME_ACTION'});
        }).toNotThrow();
      });

      it('should not throw if happening between dispatches', () => {
        const next = action => action;

        const dispatch = middleware(next);

        dispatch({type: 'SOME_ACTION'});
        state = nonMutation(state);
        expect(() => {
          dispatch({type: 'SOME_OTHER_ACTION'});
        }).toNotThrow();
      });
    }

    beforeEach(() => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};
    });

    it('should send the action through the middleware chain', () => {
      const next = action => action;
      const dispatch = middleware(next);

      expect(dispatch({type: 'SOME_ACTION'})).toEqual({type: 'SOME_ACTION'});
    });

    const mutations = {
      'mutating nested array': (s) => {
        s.foo.bar.push(5);
        return s;
      },
      'mutating nested array and setting new root object': (s) => {
        s.foo.bar.push(5);
        return {...s};
      },
      'changing nested string': (s) => {
        s.foo.baz = 'changed!';
        return s;
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
      }
    };

    Object.keys(nonMutations).forEach((nonMutationDesc) => {
      describe(`not mutating state by ${nonMutationDesc}`, () => {
        testCasesForNonMutation(nonMutations[nonMutationDesc]);
      });
    });
  });
});
