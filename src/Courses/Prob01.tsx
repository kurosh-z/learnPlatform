import React from 'react';
import { css as emoCss } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import Integral from './math-components/Integral';
import Text from './math-components/Text';
import MathJaxNode from '../mathjax/MathJaxNode';
const symbols = {
  Alpha: 'Α',
  '\\alpha': 'α',
  Beta: 'Β',
  beta: 'β'
};
const tex = ` f(x) = \\int_{-\\infty}^\\infty\\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi `;
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
  const mathdefault = emoCss({
    fontFamily: 'KaTeX_Math',
    fontStyle: 'italic',
    fontSize: '2rem'
  });

  return (
    <div css={prob01}>
      <svg
        css={mathsvg}
        xmlns='http://www.w3.org/2000/svg'
        fill='white'
        width={600}
        height={'100%'}>
        {/* <Text math={'\\beta'}></Text> */}
        <Integral />
      </svg>
      <MathJaxNode formula={tex} />
    </div>
  );
};

export default Prob01;
