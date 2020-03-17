import React from 'react';
import { css as emoCss, Global } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import Integral from './math-components/Integral';
import Group from './math-components/Group';
import Symb from './math-components/Symb';
import Exponent from './math-components/Exponent';
import Symbs from './math-components/Symbs';
// import MathJaxNode from '../mathjax/MathJaxNode';

const tex = ` f(x) = \\int_{-\\infty}^\\infty\\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi `;

const TestEl: React.FC<{ dx?: number; dy?: number; className?: string }> = ({
  dx,
  dy,
  className
}) => {
  return (
    <Exponent dx={dx}>
      <Group>
        <Symb symb={'y'} className={`letter ${className}`} />
      </Group>
      <Group>
        <Symb symb={'\\beta'} className={`letter ${className}`} />
        <Symb symb={'\\gamma'} className={`letter ${className}`} />
      </Group>
    </Exponent>
  );
};

const Integrand: React.FC<{ dx?: number; dy?: number; className?: string }> = ({
  dx,
  dy,
  className
}) => {
  return (
    <Exponent dx={dx}>
      <Group>
        {/* <Symb symb={'x'} className={`letter ${className}`} /> */}
        <TestEl />
      </Group>
      <Group>
        <Symb symb={'\\pi'} className={`letter ${className}`} />
        <Symb symb={'\\xi'} className={`letter ${className}`} />
      </Group>
    </Exponent>
  );
};
const Prob01: React.FC<{}> = () => {
  const theme = useTheme<Theme>();
  const prob01 = emoCss({
    backgroundColor: theme.palette.white.dark,
    width: '100vw',
    height: '30vh'
  });
  const mathsvg = emoCss({
    background: 'transparent'
  });
  const mathexpression = emoCss({
    '.katexfont': {
      fontFamily: 'KaTeX_Main',
      fontSize: '1.2rem',
      lineHeight: '1.2rem',

      '.letter': {
        fontFamily: 'KaTeX_Math',
        fontStyle: 'italic'
      },
      '.number': {
        fontFamily: 'KaTex_Main'
      },
      '.operator': {
        fontFamily: 'KaTeX_Size2',
        fontSize: '1.2rem'
      },
      '.power': {
        fontSize: '.7em'
      }
    }
  });
  return (
    <div css={prob01}>
      <Global styles={mathexpression} />
      <svg
        css={mathsvg}
        className='katexfont'
        xmlns='http://www.w3.org/2000/svg'
        width={600}
        height={'100%'}>
        <text x={150} y={100}>
          {/* <Integral>
            <Group>
              <Integrand />
            </Group>
          </Integral> */}
          <Symbs symbs='097\beta23\alpha\gamma\Gamma' />
        </text>
      </svg>
      {/* <MathJaxNode
        formula={tex}
        inline
        style={{ position: 'absolute', top: 400, left: 200 }}
      /> */}
    </div>
  );
};

export default Prob01;
