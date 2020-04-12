import React, { useState, useEffect } from 'react';
import { css as emoCss } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import Calibrator from './math-components/Calibrator';
import Latex from './math-components/Latex';
// import MathJaxNode from '../mathjax/MathJaxNode';

// const tex =
//   'f(x) = \\int_{-\\infty}^\\infty\\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi';

const Prob01: React.FC<{}> = () => {
  const theme = useTheme<Theme>();

  const prob01 = emoCss({
    backgroundColor: theme.palette.gray.base,
    fill: theme.palette.white.dark,
    width: '600vw',
    height: '100vh',
    overflow: 'visible',
    svg: {
      position: 'absolute',
      top: 49,
    },
  });
  const mathsvg = emoCss({
    background: 'transparent',
  });

  return (
    <div css={prob01}>
      {/* <Calibrator /> */}
      <svg
        css={mathsvg}
        className='katexfont'
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        width={'1000'}
        height={'1000'}>
        <Latex
          x={300}
          y={300}
          math={String.raw`
         e^{\intf(x)}  
           `}
        />
      </svg>

      {/*  \begin{bmatrix}
          a_0 & \int_{f(t)}^{g(t)}  & a_3\\
          a_n & a_2 & a_3\\
          b_0 & b_2 & b_3
          \end{bmatrix} */}

      {/* <MathJaxNode
        formula={tex}
        inline
        style={{ position: 'absolute', top: 400, left: 200 }}
      /> */}
    </div>
  );
};

export default Prob01;
