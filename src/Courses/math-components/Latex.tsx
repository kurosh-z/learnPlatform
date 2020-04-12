import React, { useMemo } from 'react';
import { MathCss, parserFactory } from './parser';
import { ParserOutputList, ParserOutput } from './parser/Parser';
import { text } from 'd3';

type LatexProps = {
  math?: string;
  x: number;
  y: number;
  style?: React.CSSProperties;
  letterSpacing?: number;
  className?: string;
};

const Latex: React.FC<LatexProps> = ({ math, x, y, children }) => {
  if (!children && !math)
    throw new Error('one of the math propertie or child should be given!');
  const mathFormula = children ? children.toString() : math;
  const { parserOutput, mathcss } = useMemo(() => {
    const mathcss = new MathCss(1.5);
    const parser = parserFactory({
      str: mathFormula,
      pfontSizes: mathcss.fontSizes,
    });

    const parserOutput = parser.outputs;
    const negPoint = parser._checkline(
      parser.BBox.left,
      parser.BBox.bottom,
      'bottom'
    );
    const posPoint = parser._checkline(
      parser.BBox.right,
      parser.BBox.top,
      'top'
    );

    parserOutput.push(negPoint);
    parserOutput.push(posPoint);
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
  pgroupAttr?: ParserOutput<'PGroup'>['gattr'];
};
const ParserComp: React.FC<ParserCompProps> = ({ parserOut, pgroupAttr }) => {
  return (
    <g {...pgroupAttr}>
      {parserOut.map((output, idx: number) => {
        const { component } = output;
        if (component === 'text') {
          const { attr, mathExpr } = output as ParserOutput<'Ptext'>;
          return (
            <text key={idx} {...attr}>
              {mathExpr}
            </text>
          );
        } else if (component === 'group') {
          const { gattr, gelements } = output as ParserOutput<'PGroup'>;
          return (
            <ParserComp key={idx} pgroupAttr={gattr} parserOut={gelements} />
          );
        } else if (component === 'delimiter') {
          const { dattr, dtype } = output as ParserOutput<'Pdelimiter'>;
          return <DelimiterComp key={idx} dattr={dattr} dtype={dtype} />;
        }
      })}
    </g>
  );
};

type DelimiterProps = {
  dattr: ParserOutput<'Pdelimiter'>['dattr'];
  dtype: ParserOutput<'Pdelimiter'>['dtype'];
};

const DelimiterComp: React.FC<DelimiterProps> = ({ dattr, dtype }) => {
  const { transform, height, text } = dattr;
  return (
    <>
      <path
        className={dtype}
        d={DELIMITER_PATH[dtype](height)}
        transform={transform}
      />
      {text && (
        <text
          x={-30}
          y={-5}
          style={{ fontSize: '.8rem', fill: '#87D37C' }}
          transform={transform}>
          {text}
        </text>
      )}
    </>
  );
};

const DELIMITER_PATH = {
  bracket_open: (height: number) => `M8 -${height / 2} h-8 v${height} h8 `,
  bracket_close: (height: number) => `M-8 -${height / 2} h8 v${height} h-8 `,
  check_line: (height: number) => `M-10 0 h20 m-10 -10 v20 `,
};
