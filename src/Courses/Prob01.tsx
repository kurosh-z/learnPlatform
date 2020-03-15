import React from 'react';
import { css as emoCss, Global } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import Integral from './math-components/Integral';
import MathJaxNode from '../mathjax/MathJaxNode';

const tex = ` f(x) = \\int_{-\\infty}^\\infty\\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi `;
const Prob01: React.FC<{}> = () => {
  const theme = useTheme<Theme>();
  const prob01 = emoCss({
    backgroundColor: theme.palette.aubergine.base,
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

      '.operand': {
        fontFamily: 'KaTeX_Size2',
        fontSize: '1.2em',
        color: 'white'
      },
      '.letter': {
        fontFamily: 'KaTeX_Math',
        fontStyle: 'italic'
      },
      '.number': {
        fontFamily: 'KaTex_Main'
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
        fill='white'
        width={600}
        height={'100%'}>
        <Integral />
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
