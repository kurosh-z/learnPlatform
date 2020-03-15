import React, { ReactNode, ReactElement } from 'react';
import { css as emoCss } from '@emotion/core';

import { useTheme } from 'emotion-theming';
import { Theme } from '../../theme/types';
import Symb from './Symb';

type IntegralProps = {
  children?: ReactNode;
  math?: string;
};
const Integral: React.FC<IntegralProps> = ({ children, math }) => {
  const theme = useTheme<Theme>();

  //   console.log(children);
  return (
    <g className='intergral'>
      <text className='operand' x={100} y={100}>
        ∫
      </text>
      <Exponent className='integrand' x={100} y={100} dx={24}>
        <Symb symb={'x'} type='letter' />
        <Group>
          <Symb symb={'\\pi'} type='letter' />
          <Symb symb={'\\xi'} type='letter' />
        </Group>
      </Exponent>
    </g>
  );
};

export default Integral;

interface ExponentProps {
  className?: string;
  dx?: number;
  dy?: number;
  x?: number;
  y?: number;
}
const Exponent: React.FC<ExponentProps> = ({
  className,
  x,
  y,
  dx,
  dy,
  children
}) => {
  // set dy of the first element of the power group by setting the groupAttrs
  const groupAttrs = { 0: { dy: -12 }, any: { className: 'power' } };
  return (
    <text x={x} y={y} dx={dx} dy={dy} className={`mathpower ${className}`}>
      {React.Children.map(children, (child: ReactElement, idx: number) => {
        return React.cloneElement(child, {
          ...child.props,
          // second child is power so we have to change dy:
          groupAttrs: idx === 1 ? groupAttrs : {}
        });
      })}
    </text>
  );
};

type GroupProps = {
  children: ReactElement[];
  groupAttrs?: Object; // in object kesy are index of the element witch the attribute should be assigned to and
  // values are attributes
};

/*Grouping the elements and  asign them  common attributes
  groupAtrs is an array of objects containing index and atributes, 
  index : index of the element in the gorup witch the attribute should be assigned to
  use any as key of groupAttrs to set an attribute for every elements inside the group
*/
const Group: React.FC<GroupProps> = ({ children, groupAttrs }) => {
  const defaultGroupAttrs = 'any' in groupAttrs ? groupAttrs['any'] : {};
  return (
    <>
      {React.Children.map(children, (child: ReactElement, idx: number) => {
        let childAttr =
          idx in groupAttrs
            ? { ...defaultGroupAttrs, ...groupAttrs[idx] }
            : defaultGroupAttrs;

        return React.cloneElement(child, {
          ...child.props,
          ...childAttr
        });
      })}
    </>
  );
};
