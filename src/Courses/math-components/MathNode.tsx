import React, { ReactElement, useRef, useLayoutEffect } from 'react';

// const TestArray = [];
// export default TestArray;

type ElObj = { El: React.FC<any>; elProps: Object };
export const useEl = () => {
  const elRef = useRef<ElObj>({ El: null, elProps: null });

  //   useLayoutEffect(() => {
  //     const el = Circle;
  //     const elProps = { x: 100, y: 60 };
  //     setElements(() => ({ El: el, elProps: elProps }));
  //   }, []);
  return elRef;
};

const Circle: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  return <circle cx={x} cy={y} r={30} fill='red' />;
};
