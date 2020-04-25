import React, { useState, useEffect } from 'React';
import { css as emoCSS } from '@emotion/core';
import Latex from './Latex';
import { useLatexBBox } from './LatexContext';
const InlineLatex: React.FC<{ font_size: number; math_formula: string }> = ({
  font_size,
  math_formula,
}) => {
  const inlineLatex = emoCSS({
    height: font_size + 'rem',
    display: 'block',
    // position: 'absolute',
    marginLeft: '0.25rem',
    // marginRight: '.25rem',
  });
  //   const [width, setWidth] = useState(10);
  //   const [latexBBox] = useLatexBBox();

  return (
    <span css={inlineLatex}>
      <svg
        className='katexfont '
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        // viewBox={`0 0 ${50} ${50}`}
        height={font_size * 18}
        width={25}
        // style={{ backgroundColor: 'gray' }}
      >
        <Latex
          font_size={font_size}
          y={font_size * 16}
          mathFormula={math_formula}
          latexId={inlineLatex.name}
        />
      </svg>
    </span>
  );
};

export default InlineLatex;
