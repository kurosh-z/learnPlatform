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
    backgroundColor: theme.palette.white.dark,
    width: '100vw',
    height: '100vh',
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
        width={'800'}
        height={'900'}>
        <Latex
          x={40}
          y={130}
          // math={'abc_{df} kf'}
          // math={`kdf\\begin{bmatrix}
          //           a_1 & a_2 & a_3\\\\
          //           b_1 & b_2 & b_3 \\\\
          //           1 & 2 & 3 \\\\
          //           4 & 5 &6 \\\\
          //           8 & 9 & 10
          //           \\end{bmatrix}
          //           `}
          math={`kdf\\begin{bmatrix}
                    a_1 & a_2 & a_3\\\\
                    b_1 & b_2 & b_3 \\\\
                    \\end{bmatrix} jhh
                    `}
        />
      </svg>
      {/* math={'ab_{c_{k}^{t}}^{d}'} */}
      {/* <MathJaxNode
        formula={tex}
        inline
        style={{ position: 'absolute', top: 400, left: 200 }}
      /> */}
    </div>
  );
};

export default Prob01;
