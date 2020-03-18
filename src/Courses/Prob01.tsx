import React, { useState, useEffect } from 'react';
import { css as emoCss, Global } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import Integral from './math-components/Integral';
import Group from './math-components/Group';
import Symb from './math-components/Symb';
import Power from './math-components/Power';
import Symbs from './math-components/Symbs';
import MathJaxNode from '../mathjax/MathJaxNode';

const tex = ` f(x) = \\int_{-\\infty}^\\infty\\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi `;

const Integrand: React.FC<{ dx?: number; dy?: number; className?: string }> = ({
  dx,
  dy,
  className
}) => {
  return (
    <Power dx={dx} dy={dy}>
      <Group>
        <Symb symb={'x'} className={`letter ${className}`} />
        {/* <Symbs symbs='4945.8abc23\alpha\gamma kjk9\Gamma 9.45' /> */}
      </Group>
      <Group>
        {/* <Symb symb={'\\pi'} className={`letter ${className}`} />
        <Symb symb={'\\xi'} className={`letter ${className}`} /> */}
        <Symbs symbs='4945.8abc23\alpha\gamma kjk9\Gamma 9.45' />
      </Group>
    </Power>
  );
};
const Prob01: React.FC<{}> = () => {
  const theme = useTheme<Theme>();
  const [textHovered, setTextHover] = useState<boolean>(false);
  // useEffect(() => {
  //   const expEl = document.querySelectorAll('.power_exp');
  //   expEl.forEach((el, idx) => {
  //     el.addEventListener('click', () => {
  //       setTextHover(true);
  //       console.log('onmouseover');
  //     });
  //   });
  // }, []);
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
        fontSize: '1em'
      },
      '.power_exp': {
        fontSize: '.7em'
      },
      '.int_from , .int_to': {
        fontSize: '.85em'
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
        <text
          transform={`scale(${textHovered ? 2 : 1})`}
          // style={{
          //   cursor: textHovered ? 'pointer' : 'default',
          //   fontSize: textHovered ? '2rem' : '1.2rem '
          // }}
          x={!textHovered ? 100 : 50}
          y={!textHovered ? 50 : 40}
          onMouseEnter={() => {
            setTextHover(() => true);
          }}
          onMouseLeave={() => {
            setTextHover(() => false);
          }}>
          <Integral>
            <Group>
              <Symbs symbs='x2' />
            </Group>
            <Group>
              <Symbs symbs='y2' />
            </Group>
            <Group>
              <Integrand />
            </Group>
          </Integral>
        </text>
      </svg>
      <MathJaxNode
        formula={tex}
        inline
        style={{ position: 'absolute', top: 400, left: 200 }}
      />
    </div>
  );
};

export default Prob01;
