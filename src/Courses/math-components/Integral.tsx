import React, { ReactElement, useState, useRef, useLayoutEffect } from 'react';
import Symbs from './Symbs';
import mathSymols from './mathsymbols';
const getCharWidth = mathSymols.getCharWidth;

const INT_WIDTH = getCharWidth('∫');
const FROM_DX = 16;
const TO_DX = 16;
const FROM_DY = 18;
const TO_DY = -18;

type IntegralProps = {
  x: number;
  y: number;
  children?: ReactElement[] | ReactElement;
};
// children should alwasy be given as Group element
// first children: child0: int_from, child1: int_to, child2: integrand
// if just one child is provided it rendered integrand
const Integral: React.FC<IntegralProps> = ({ x, y, children }) => {
  const [intergrandX, setLenght] = useState(x + TO_DX + INT_WIDTH);
  const fromRef = useRef<SVGGElement>(null);
  const toRef = useRef<SVGAElement>(null);
  useLayoutEffect(() => {
    if (fromRef.current && toRef.current) {
      const fromWidth = fromRef.current.getBBox().width;
      const toWidth = toRef.current.getBBox().width;
      let intergrandX = fromWidth >= toWidth ? fromWidth : toWidth;
      intergrandX += x + TO_DX + INT_WIDTH;
      setLenght(() => intergrandX);
    }
  }, []);

  return (
    <g>
      <Symbs symbs='∫' className='operator' x={x} y={y} />
      <>
        {React.Children.map(children, (child: ReactElement, idx: number) => {
          if ((idx === 0 && !children['length']) || idx === 2) {
            // the only child gets rendered as Integrand

            return (
              <g
                className='integrand'
                transform={`translate(${intergrandX} ${y})`}>
                >
                {React.cloneElement(child, {
                  ...child.props
                })}
              </g>
            );
          }
          if (idx === 0 && children['length']) {
            // the first child gets renderd as int_from

            return (
              <g
                ref={fromRef}
                className='int_from'
                transform={`translate(${x + INT_WIDTH + FROM_DX} ${y +
                  FROM_DY})`}>
                >
                {React.cloneElement(child, {
                  ...child.props
                })}
              </g>
            );
          }
          if (idx === 1) {
            // second child gets rendered as int_to
            return (
              <g
                ref={toRef}
                className='int_to'
                transform={`translate(${x + INT_WIDTH + TO_DX} ${y + TO_DY})`}>
                >
                {React.cloneElement(child, {
                  ...child.props
                })}
              </g>
            );
          }
        })}
      </>
    </g>
  );
};

export default Integral;
