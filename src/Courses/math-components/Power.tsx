import React, { ReactElement } from 'react';
import Group, { GroupAttributes } from './Group';
const SUPERSCRIP_DY = -12;

interface ExponentProps {
  dx?: number;
  dy?: number;
  children: ReactElement[];
}
const Power: React.FC<ExponentProps> = ({ dx = 0, dy = 0, children }) => {
  // base
  const groupAttrs0: GroupAttributes = {
    0: { set: { dx: dx, dy: dy } },
    any: { update: { className: 'power_base' } }
  };
  // power: set dy and className of the first element of the power group by setting the groupAttrs
  const groupAttrs1: GroupAttributes = {
    0: { set: { dy: SUPERSCRIP_DY } },
    any: { update: { className: 'power_exp' } }
  };
  if (children.length !== 2)
    throw new Error(
      `expected two Group Elements as children of Exponent Element got ${
        !children ? 0 : children.length | 1
      }`
    );

  return (
    // <text x={x} y={y} dx={dx} dy={dy} className={`mathpower ${className}`}>
    <Group>
      {React.Children.map(children, (child, idx: number) => {
        return idx === 0
          ? React.cloneElement(child, {
              ...child.props,
              groupAttrs: groupAttrs0
            })
          : idx === 1 &&
              React.cloneElement(child, {
                ...child.props,
                // second child is power so we have to change dy:
                groupAttrs: groupAttrs1
              });
      })}
    </Group>
    // </text>
  );
};

export default Power;
