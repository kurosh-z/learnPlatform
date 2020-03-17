import React, { ReactNode, ReactElement } from 'react';
import Symb from './Symb';
import Group, { GroupAttributes } from './Group';

const INEGRAND_DX = 10;
type IntegralProps = {
  dx?: number;
  dy?: number;
  children: ReactElement;
};
const Integral: React.FC<IntegralProps> = ({ dx, dy, children }) => {
  const groupAttrs: GroupAttributes = {
    0: { set: { dx: INEGRAND_DX } },
    any: { update: { className: 'integrand' } }
  };

  return (
    <Group>
      <Symb symb='∫' className='operator' dx={dx} dy={dy} />
      {React.cloneElement(children, { ...children.props, groupAttrs })}
    </Group>
  );
};

export default Integral;
