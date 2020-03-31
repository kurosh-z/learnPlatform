import React, { useMemo, useEffect, useLayoutEffect, useState } from 'react';
import mathSymols from './mathsymbols';
import Parser from './Parser';
const getlatexSymbol = mathSymols.getlatexSymbol;
const getStringWidth = mathSymols.getStringWidth;
const greekKeys = mathSymols.getGreekKeys();

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

  const mathExprList = useMemo(() => {
    const parser = new Parser({ str: math });
    const mathExprList = parser.parse();
    return mathExprList;
  }, [math]);

  return (
    <g transform={`translate(${x} ${y})`}>
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
