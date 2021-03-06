import React, { useState, useReducer, useEffect } from 'react';
import { useMockRender } from '@/components/shared/hooks';

interface WorkHook {
  memoriedState: any;
  next: WorkHook | undefined;
}

let firstWorkHook: WorkHook = {
  memoriedState: undefined,
  next: undefined,
};

let nextWorkHook = firstWorkHook;

function useMockReducer(reducer: Function, initArg: any, init?: Function) {
  const [mockRender] = useMockRender();
  let current: WorkHook = nextWorkHook;
  if (typeof current.memoriedState === 'undefined') {
    let initState = initArg;
    if (typeof init === 'function') {
      initState = init(initArg);
    }
    current.memoriedState = initState;
  }
  current.next = nextWorkHook = current.next
    ? current.next
    : { memoriedState: undefined, next: undefined };
  let dispatch = (action: any) => {
    current.memoriedState = reducer(current.memoriedState, action);
    nextWorkHook = firstWorkHook;
    mockRender(num => num + 1);
  };
  return [current.memoriedState, dispatch];
}

function useMockState(initialState: any) {
  return useMockReducer((state: any, action: any) => {
    return action;
  }, initialState);
}

function useMockEffect(callback: Function, dependencies?: any[]) {
  if (typeof dependencies === 'undefined') {
    return callback();
  }
  let current = nextWorkHook;
  let memoriedDependencies = current.memoriedState;
  if (typeof memoriedDependencies === 'undefined') {
    current.memoriedState = dependencies;
    callback();
  } else {
    if (
      !dependencies.every((item, index) => item === memoriedDependencies[index])
    ) {
      callback();
      current.memoriedState = dependencies;
    }
  }
  current.next = nextWorkHook = current.next
    ? current.next
    : { memoriedState: undefined, next: undefined };
}

const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

let reducer = (number: any, action: any) => {
  switch (action.type) {
    case INCREMENT:
      return number + 1;
    case DECREMENT:
      return number - 1;
    default:
      return number;
  }
};
let init = (number: number) => {
  return number;
};

const MockCounter = () => {
  let [number, dispatch] = useMockReducer(reducer, 0, init);
  let [name, setName] = useMockState('?????????');
  return (
    <>
      <p>
        {name}:{number}
      </p>
      <button onClick={() => dispatch({ type: INCREMENT })}>??????</button>
      <button
        onClick={() => {
          dispatch({ type: INCREMENT });
          dispatch({ type: INCREMENT });
        }}
      >
        ??????&amp;??????
      </button>
      <button onClick={() => dispatch({ type: DECREMENT })}>??????</button>
      <button onClick={() => setName('?????????' + Date.now())}>?????????</button>
    </>
  );
};
const Counter = () => {
  let [number, dispatch] = useReducer(reducer, 0, init);
  let [name, setName] = useState('?????????');
  return (
    <>
      <p>
        {name}:{number}
      </p>
      <button onClick={() => dispatch({ type: INCREMENT })}>??????</button>
      <button
        onClick={() => {
          dispatch({ type: INCREMENT });
          dispatch({ type: INCREMENT });
        }}
      >
        ??????&amp;??????
      </button>
      <button
        onClick={() => {
          setTimeout(() => {
            dispatch({ type: INCREMENT });
            dispatch({ type: INCREMENT });
          }, 0);
        }}
      >
        setTimeout??????&amp;??????
      </button>
      <button onClick={() => dispatch({ type: DECREMENT })}>??????</button>
      <button onClick={() => setName('?????????' + Date.now())}>?????????</button>
    </>
  );
};

const ReactHookImpl: React.FC = () => {
  return (
    <div>
      <div>
        <h3>?????????hooks</h3>
        <Counter></Counter>
      </div>
      <div>
        <h3>?????????hooks</h3>
        <MockCounter></MockCounter>
      </div>
    </div>
  );
};

export default ReactHookImpl;
