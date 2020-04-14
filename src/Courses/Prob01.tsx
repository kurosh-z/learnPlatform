import React, { useState, useEffect, useRef } from 'react';
import { css as emoCss } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import Calibrator from './math-components/Calibrator';
import Latex from './math-components/Latex';
import { useSpring, animated } from 'react-spring';
import Button from '../components/Button/Button';
// import MathJaxNode from '../mathjax/MathJaxNode';

// const tex =
//   'f(x) = \\int_{-\\infty}^\\infty\\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi';

const ALatex = animated(Latex);
const LatexAnim = animated(Latex.Anim);
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
  const [toggle, toggler] = useState<boolean>(false);

  const [animProps, set] = useSpring(() => ({
    transform: 'translate(0px,0px)',
    opacity: 1,
    fill: 'white',
  }));
  set({
    transform: toggle ? 'translate(20px,-100px)' : 'translate(0px,0px)',
    opacity: toggle ? 0.9 : 1,
    fill: toggle ? '#87D37C' : 'white',
  });
  return (
    <div css={prob01}>
      {/* <Calibrator /> */}
      <Button
        onClick={() => {
          toggler(!toggle);
        }}
        size={'md'}>
        animate
      </Button>
      <svg
        css={mathsvg}
        className='katexfont'
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        width={'1000'}
        height={'1000'}>
        <Latex
          x={100}
          y={300}
          mathFormula={String.raw`\begin{bmatrix} \anim<child1>{a_1} \\
                                                  a_2 \\
                                                  a_3\\
                                  \end{bmatrix} 
                                 `}>
          <Latex.Anim id={'child1'} fill={'#4aed75'} style={animProps} />
        </Latex>
      </svg>

      {/*  c^{\begin{bmatrix}
          a & b  & c\\
          1 & 2 & 3\\
          b_0 & b_2 & b_3
          \end{bmatrix}}*/}

      {/* <MathJaxNode
        formula={tex}
        inline
        style={{ position: 'absolute', top: 400, left: 200 }}
      /> */}
    </div>
  );
};

export default Prob01;
