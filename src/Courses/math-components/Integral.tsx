import React from 'react';
import { css as emoCss, ClassNames } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../../theme/types';
import { Text } from './Text';

const symbols = {
  Alpha: 'Α',
  '\\alpha': 'α',
  '\x2A': '45',
  Beta: 'Β',
  '\\beta': 'β'
};
type IntegralProps = {
  children?: string;
  math?: string;
};
const Integral: React.FC<IntegralProps> = ({ children, math }) => {
  const theme = useTheme<Theme>();

  const mathexpression = emoCss({
    fontFamily: 'KaTeX_Main',
    lineHeight: '1.2em',
    '.operand': {
      fontFamily: 'KaTeX_Size2',
      fontSize: '1.4rem',
      color: 'white'
    },
    '.integrand': {
      fontFamily: 'KaTeX_Math',
      fontStyle: 'italic'
    },
    '.power': {
      fontSize: '.7em'
    }
  });
  //   console.log(children);
  return (
    <g css={mathexpression}>
      <text className='operand' x={100} y={100}>
        ∫
        <Power className='integrand' dx={8} base={'x'} power={'2b'} />
      </text>
    </g>
  );
};

export default Integral;

interface PowerProps {
  base?: string;
  power?: string;
  className?: string;
  dx?: number;
  dy?: number;
}
const Power: React.FC<PowerProps> = ({ base, power, className, dx, dy }) => {
  console.log(className);
  return (
    <>
      <tspan dx={dx} dy={dy} className={`base ${className}`}>
        {base}
      </tspan>
      <tspan className='power' dy={-12}>
        {power}
      </tspan>
    </>
  );
};
