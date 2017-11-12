import expect from 'expect';
import immutableStateInvariantMiddleware from '../src/index';
import sinon from 'sinon';

describe('immutableStateInvariantMiddleware', () => {
  let state;
  const getState = () => state;

  function middleware(options) {
    return immutableStateInvariantMiddleware(options)({getState});
  }

  beforeEach(() => {
    state = {foo: {bar: [2, 3, 4], baz: 'baz'}};
  });

  it('sends the action through the middleware chain', () => {
    const next = action => ({...action, returned: true});
    const dispatch = middleware()(next);

    expect(dispatch({type: 'SOME_ACTION'})).toEqual({type: 'SOME_ACTION', returned: true});
  });

  it('throws if mutating inside the dispatch', () => {
    const next = action => {
      state.foo.bar.push(5);
      return action;
    };

    const dispatch = middleware()(next);

    expect(() => {
      dispatch({type: 'SOME_ACTION'});
    }).toThrow(new RegExp('foo\\.bar\\.3'));
  });

  it('throws if mutating between dispatches', () => {
    const next = action => action;

    const dispatch = middleware()(next);

    dispatch({type: 'SOME_ACTION'});
    state.foo.bar.push(5);
    expect(() => {
      dispatch({type: 'SOME_OTHER_ACTION'});
    }).toThrow(new RegExp('foo\\.bar\\.3'));
  });

  it('does not throw if not mutating inside the dispatch', () => {
    const next = action => {
      state = {...state, foo: {...state.foo, baz: 'changed!'}};
      return action;
    };

    const dispatch = middleware()(next);

    expect(() => {
      dispatch({type: 'SOME_ACTION'});
    }).toNotThrow();
  });

  it('does not throw if not mutating between dispatches', () => {
    const next = action => action;

    const dispatch = middleware()(next);

    dispatch({type: 'SOME_ACTION'});
    state = {...state, foo: {...state.foo, baz: 'changed!'}};
    expect(() => {
      dispatch({type: 'SOME_OTHER_ACTION'});
    }).toNotThrow();
  });

  it('works correctly with circular references', () => {
    const next = action => action;

    const dispatch = middleware()(next);

    let x = {};
    let y = {};
    x.y = y;
    y.x = x;

    expect(() => {
      dispatch({type: 'SOME_ACTION', x});
    }).toNotThrow();
  });

  it('respects "isImmutable" option', function () {
    const isImmutable = (value) => true
    const next = action => {
      state.foo.bar.push(5);
      return action;
    };

    const dispatch = middleware({ isImmutable })(next);

    expect(() => {
      dispatch({type: 'SOME_ACTION'});
    }).toNotThrow();
  });

  it('respects "ignore" option', () => {
    const next = action => {
      state.foo.bar.push(5);
      return action;
    };

    const dispatch = middleware({ ignore: ['foo.bar'] })(next);

    expect(() => {
      dispatch({type: 'SOME_ACTION'});
    }).toNotThrow();
  });
});

describe('immutableStateInvariantMiddleware with console logging', () => {
  let state;
  const getState = () => state;

  function middleware(options) {
    return immutableStateInvariantMiddleware(options)({getState});
  }

  beforeEach(() => {
    sinon.spy(console, 'error');
    state = {foo: {bar: [2, 3, 4], baz: 'baz'}};
  });

  afterEach(() => {
    console.error.restore();
  });

  it('logs if mutating inside the dispatch', () => {
    const next = action => {
      state.foo.bar.push(5);
      return action;
    };

    const dispatch = middleware({ logToConsoleOnly: true })(next);

    expect(() => {
      dispatch({type: 'SOME_ACTION'});
    }).toNotThrow();
    expect(console.error.calledWith(sinon.match.any, sinon.match(new RegExp('foo\\.bar\\.3')))).toEqual(true);
  });

  it('logs if mutating between dispatches', () => {
    const next = action => action;

    const dispatch = middleware({ logToConsoleOnly: true })(next);

    dispatch({type: 'SOME_ACTION'});
    state.foo.bar.push(5);
    expect(() => {
      dispatch({type: 'SOME_OTHER_ACTION'});
    }).toNotThrow();
    expect(console.error.calledWith(sinon.match.any, sinon.match(new RegExp('foo\\.bar\\.3')))).toEqual(true);
  });
});
