import React, { useState, useEffect } from 'react';
import { css as emoCss, Global } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import Integral from './math-components/Integral';
// import Symbs from './math-components/Symbs';
import Latex from './math-components/Latex';
// import MathJaxNode from '../mathjax/MathJaxNode';

const tex = ` f(x) = \\int_{-\\infty}^\\infty\\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi `;

// const FirstInt: React.FC<{ opacity?: number; x?: number }> = ({
//   x = 0,
//   opacity = 1
// }) => {
//   return (
//     <Integral x={100} y={100}>
//       <Symbs symbs={'f(x)'} x={0} y={0} />
//       <Symbs symbs={'g(x)'} x={0} y={0} />
//       <g
//         style={{ opacity: opacity, transform: `translate(${x}px, 0)` }}
//         // transform={`translate(${x} 0)`}
//       >
//         <Symbs symbs={'h(x)'} x={x} y={0} />
//       </g>
//     </Integral>
//   );
// };

const Prob01: React.FC<{}> = () => {
  const theme = useTheme<Theme>();
  // const [textHovered, setTextHover] = useState<boolean>(false);
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

      '.math_letter': {
        fontFamily: 'KaTeX_Size2',
        fontStyle: 'italic'
        // fontWeight: 'bold'
      },
      '.math_number': {
        fontFamily: 'KaTex_Main'
      },
      '.math_op': {
        fontFamily: 'KaTeX_Size2',
        fontSize: '1em'
      },
      '.math_power_exp': {
        fontSize: '.7em'
      },
      '.math_int_from , .math_int_to': {
        fontSize: '.85em'
      },
      '.scriptSize': {
        fontSize: '0.7em'
      },
      '.tiny': {
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
        xmlnsXlink='http://www.w3.org/1999/xlink'
        width={600}
        height={'100%'}>
        {/* <Symbs symbs='ABCDEF\beta\alpha\gamma kd' x={100} y={200} /> */}
        <Latex x={100} y={60} math={'a_{b_{k}}^{d}h'} />
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
