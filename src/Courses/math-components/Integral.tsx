import React, {
  ReactElement,
  useState,
  useEffect,
  useRef,
  useLayoutEffect
} from 'react';
import Symbs from './Symbs';
import Group, { GroupAttributes } from './Group';
import { getCharWidth, getStringWidth } from './mathsymbols';

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
  const [{ fromLength, toLength, intergrandX }, setLenght] = useState({
    fromLength: 0,
    toLength: 0,
    intergrandX: 0
  });
  const fromRef = useRef<SVGGElement>(null);
  const toRef = useRef<SVGAElement>(null);
  useLayoutEffect(() => {
    if (fromRef.current && toRef.current) {
      const fromWidth = fromRef.current.getBBox().width;
      setLenght(lObj => ({ ...lObj, fromWidth: fromWidth }));
      const toWidth = toRef.current.getBBox().width;
      setLenght(lObj => ({ ...lObj, toWidth: toWidth }));
      let intergrandX = fromWidth >= toWidth ? fromWidth : toWidth;
      intergrandX += x + getCharWidth('∫') + TO_DX;
      setLenght(lObj => ({ ...lObj, intergrandX: intergrandX }));
    }
  }, []);

  return (
    <g>
      <Symbs symbs='∫' className='operator' x={x} y={y} />
      <>
        {React.Children.map(children, (child: ReactElement, idx: number) => {
          if ((idx === 0 && !children['length']) || idx === 2) {
            // the only child rendered as Integrand

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
            // the first child is being renderd as int_from

            return (
              <g
                ref={fromRef}
                className='int_from'
                transform={`translate(${x + getCharWidth('∫') + FROM_DX} ${y +
                  FROM_DY})`}>
                >
                {React.cloneElement(child, {
                  ...child.props
                })}
              </g>
            );
          }
          if (idx === 1) {
            // second child rendered as int_to
            return (
              <g
                ref={toRef}
                className='int_to'
                transform={`translate(${x + getCharWidth('∫') + TO_DX} ${y +
                  TO_DY})`}>
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
