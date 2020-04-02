import React, { useState, useEffect } from 'react';
import { css as emoCss } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';

import Latex from './math-components/Latex';
// import MathJaxNode from '../mathjax/MathJaxNode';

const tex = ` f(x) = \\int_{-\\infty}^\\infty\\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi `;

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

  return (
    <div css={prob01}>
      <svg
        css={mathsvg}
        className='katexfont'
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        width={600}
        height={'100%'}>
        {/* <Symbs symbs='ABCDEF\beta\alpha\gamma kd' x={100} y={200} /> */}
        <Latex x={100} y={60} math={'ab_{t_{2}}^{c_{1}}'} />
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
