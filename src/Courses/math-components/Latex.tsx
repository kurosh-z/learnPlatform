import React, { useMemo } from 'react';

import MathCss from './MathCss';
import parserFactory, {
  CookedMathExpr,
  ParserOutputList,
  PGroup,
  Ptext,
  Pdelimiter,
} from './Parser';

type SymbsProps = {
  math: string;
  x: number;
  y: number;
  style?: React.CSSProperties;
  letterSpacing?: number;
  className?: string;
};

type LatexGroup = {
  open: boolean;
  gElements: CookedMathExpr[];
  gattrs: CookedMathExpr['attr'];
  numOpenChildGroups: number;
};
const Latex: React.FC<SymbsProps> = ({ math, x, y, children }) => {
  if (children) throw new Error('symbs element accepts no children!');

  const { parserOutput, mathcss } = useMemo(() => {
    const mathcss = new MathCss(1.2);
    const parser = parserFactory({
      str: math,
      pfontSizes: mathcss.fontSizes,
    });

    const parserOutput = parser.outputs;
    return { parserOutput, mathcss };
  }, [math]);

  return (
    <g className={'latex'} css={mathcss.css} transform={`translate(${x} ${y})`}>
      <ParserComp parserOut={parserOutput} />
    </g>
  );
};

export default Latex;

type ParserCompProps = {
  parserOut: ParserOutputList;
  pgroupAttr?: PGroup['gattr'];
};
const ParserComp: React.FC<ParserCompProps> = ({ parserOut, pgroupAttr }) => {
  return (
    <g {...pgroupAttr}>
      {parserOut.map((output, idx: number) => {
        const { component } = output;
        if (component === 'text') {
          const { attr, mathExpr } = output as Ptext;
          return (
            <text key={idx} {...attr}>
              {mathExpr}{' '}
            </text>
          );
        } else if (component === 'group') {
          const { gattr, gelements } = output as PGroup;
          return (
            <ParserComp key={idx} pgroupAttr={gattr} parserOut={gelements} />
          );
        } else if (component === 'delimiter') {
          const { dattr, dtype } = output as Pdelimiter;
          return <DelimiterComp key={idx} dattr={dattr} dtype={dtype} />;
        }
      })}
    </g>
  );
};

type DelimiterProps = {
  dattr: Pdelimiter['dattr'];
  dtype: Pdelimiter['dtype'];
};

const DelimiterComp: React.FC<DelimiterProps> = ({ dattr, dtype }) => {
  const { transform, height } = dattr;
  return (
    <path
      className={dtype}
      d={DELIMITER_PATH[dtype](height)}
      transform={transform}
    />
  );
};

const DELIMITER_PATH = {
  bracket_open: (height: number) => `M8 -${height / 2} h-8 v${height} h8 `,
  bracket_close: (height: number) => `M-8 -${height / 2} h8 v${height} h-8 `,
  check_line: (height: number) => `M0 0 h130 `,
};
