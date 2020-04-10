import React, { useRef, useState, useEffect, useMemo } from 'react';

import MathCss from './MathCss';
import mathsymbols from './mathsymbols';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

const Calibrator: React.FC<{}> = () => {
  const textRef = useRef<SVGTextElement>(null);
  const { textCss } = useMemo(() => {
    const mathcss = new MathCss(1);
    const textCss = mathcss.css;
    return { textCss };
  }, []);
  const [charWidth, setWidth] = useState<number>(0);
  useEffect(() => {
    if (textRef.current) {
      const width = textRef.current.getBBox().width;
      setWidth(width);
      console.log(width);
    }
  }, []);
  const n = 1000;
  const str = useMemo(() => {
    var str = '';
    [...Array(n).fill(0)].forEach((el) => {
      str += 'f';
    });
    return str;
  }, []);

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      css={textCss}
      style={{ position: 'absolute', top: '150px' }}
      width={1000}
      height={1000}>
      <text x={100} y={100} className='math_letter normalsize' ref={textRef}>
        {str}
      </text>
      {/* <text x={100} y={120} className='math_letter' ref={textRef}>
        a
      </text> */}
      <text x={100} y={140}>
        charWidth: {(charWidth / n).toPrecision(18)}
      </text>
    </svg>
  );
};
// 1210001.12500000
export default Calibrator;
