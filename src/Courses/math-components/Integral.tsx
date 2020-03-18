import React, { ReactNode, ReactElement } from 'react';
import Symb from './Symb';
import Group, { GroupAttributes } from './Group';

const INEGRAND_DX = 10;
const FROM_DY = 18;
const FROM_DX = 2;
const TO_DY = -38;
const TO_DX = -10;
type IntegralProps = {
  dx?: number;
  dy?: number;
  children: ReactElement[] | ReactElement;
};
// children should alwasy be given as Group element
// first children: child0: int_from, child1: int_to, child2: integrand
// if just one child is provided it rendered integrand
const Integral: React.FC<IntegralProps> = ({ dx, dy, children }) => {
  const inegrandGroupAttrs: GroupAttributes = {
    0: { set: { dx: INEGRAND_DX, dy: children['length'] ? FROM_DY : 0 } },
    any: { update: { className: 'integrand' } }
  };

  const fromGroupAttrs: GroupAttributes = {
    0: { set: { dy: FROM_DY, dx: FROM_DX } },
    any: { update: { className: 'int_from' } }
  };
  const toGroupAttrs: GroupAttributes = {
    0: { set: { dy: TO_DY, dx: TO_DX } },
    any: { update: { className: 'int_to' } }
  };

  return (
    <Group>
      <Symb symb='∫' className='operator' dx={dx} dy={dy} />
      <>
        {React.Children.map(children, (child: ReactElement, idx: number) => {
          if ((idx === 0 && !children['length']) || idx === 2) {
            return React.cloneElement(child, {
              ...child.props,
              groupAttrs: inegrandGroupAttrs
            });
          } else if (idx !== 2) {
            return React.cloneElement(child, {
              ...child.props,
              groupAttrs: idx === 0 ? fromGroupAttrs : toGroupAttrs
            });
          }
        })}
      </>
    </Group>
  );
};

export default Integral;
