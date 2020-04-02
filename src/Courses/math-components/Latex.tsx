import React, { useMemo } from 'react';

import MathCss from './MathCss';
import parserFactory from './Parser';

type SymbsProps = {
  math: string;
  x: number;
  y: number;
  style?: React.CSSProperties;
  letterSpacing?: number;
  className?: string;
};
const Latex: React.FC<SymbsProps> = ({
  math,
  x,
  y,
  className,
  children,
  letterSpacing = 0.5,
  ...rest
}) => {
  if (children) throw new Error('symbs element accepts no children!');

  const { mathExprList, mathcss } = useMemo(() => {
    const mathcss = new MathCss(1.2);
    const parser = parserFactory({ str: math, pfontSizes: mathcss.fontSizes });
    const mathExprList = parser.cookedMathExprList;
    return { mathExprList, mathcss };
  }, [math]);

  return (
    <g css={mathcss.css} transform={`translate(${x} ${y})`}>
      {mathExprList.map((mathexpr, idx: number) => {
        const { expr, attr } = mathexpr;
        return (
          <text {...attr} key={idx}>
            {expr}
          </text>
        );
      })}
    </g>
  );
};

export default Latex;
