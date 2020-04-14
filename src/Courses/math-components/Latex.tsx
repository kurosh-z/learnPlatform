import React, { useMemo, ReactElement } from 'react';
import { animated } from 'react-spring';
import { MathCss, parserFactory } from './parser';
import Parser, { ParserOutputList, ParserOutput } from './parser/Parser';

type useParserArgs = {
  mathFormula: string;
  fontFactor: number;
};

function useParser({
  mathFormula,
  fontFactor,
}: useParserArgs): { parser: Parser; mathcss: MathCss } {
  const { parser, mathcss } = useMemo(() => {
    const mathcss = new MathCss(fontFactor);
    const parser = parserFactory({
      str: mathFormula,
      fontSizegetter: mathcss.getfontSizeFunc(),
    });
    return { parser, mathcss };
  }, [mathFormula, fontFactor]);

  return { parser, mathcss };
}

type LatexProps = {
  mathFormula?: string;
  x: number;
  y: number;
  style?: React.CSSProperties;
  fontFactor?: number;
  className?: string;
};

const Latex: React.FC<LatexProps> & LatexAnim = ({
  mathFormula,
  x,
  y,
  children,
  fontFactor = 1.8,
  style,
}) => {
  const { parser, mathcss } = useParser({ mathFormula, fontFactor });
  const parserOutput = parser.outputs;
  // const negPoint = parser._checkline(
  //   parser.BBox.left,
  //   parser.BBox.bottom,
  //   'bottom'
  // );
  // const posPoint = parser._checkline(parser.BBox.right, parser.BBox.top, 'top');

  // parserOutput.push(negPoint);
  // parserOutput.push(posPoint);
  // const childrenProps = useMemo(() => {
  //   const childrenProps: LatexChildrenProps = {};
  //   if (children) {
  //     React.Children.map(children, (child: React.ReactElement) => {
  //       const props = child.props;
  //       const id = props.id;
  //       Object.defineProperty(childrenProps, id, {
  //         value: props,
  //         enumerable: true,
  //       });
  //     });
  //   }
  //   return childrenProps;
  // }, [children]);

  const childrenProps: LatexChildrenProps = {};
  if (children) {
    React.Children.map(children, (child: React.ReactElement) => {
      const props = child.props;
      const id = props.id;
      Object.defineProperty(childrenProps, id, {
        value: { props: props, child: child },
        enumerable: true,
      });
    });
  }
  return (
    <g
      className={'latex'}
      css={mathcss.css}
      style={style}
      transform={`translate(${x} ${y})`}>
      <ParserComp parserOut={parserOutput} childrenProps={childrenProps} />>
    </g>
  );
};

type LatexChildrenProps = {
  [id: string]: {
    props: React.SVGAttributes<SVGGElement>;
    child: ReactElement;
  };
};
type ParserCompProps = {
  parserOut: ParserOutputList;
  pgroupAttr?: ParserOutput<'PGroup'>['gattr'];
  childrenProps: LatexChildrenProps;
};
const ParserComp: React.FC<ParserCompProps> = ({
  parserOut,
  pgroupAttr,
  childrenProps,
}) => {
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
            <ParserComp
              key={idx}
              pgroupAttr={gattr}
              parserOut={gelements}
              childrenProps={childrenProps}
            />
          );
        } else if (component === 'delimiter') {
          const { dattr, dtype } = output as ParserOutput<'Pdelimiter'>;
          return <DelimiterComp key={idx} dattr={dattr} dtype={dtype} />;
        } else if (component === 'animcomp') {
          const { aAttr, id, animElements } = output as ParserOutput<'Panim'>;
          const animChild = childrenProps[id]['child'];
          return (
            <PanimComp
              key={idx}
              parserOut={animElements}
              id={id}
              aAttr={aAttr}
              childrenProps={childrenProps}
              animProps={animChild.props}
            />
          );
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

type PAnimCompProps = {
  parserOut?: ParserOutputList;
  childrenProps?: LatexChildrenProps;
  aAttr?: ParserOutput<'Panim'>['aAttr'];
  id: string;
  animProps?: React.SVGAttributes<SVGGElement>;
};
const PanimComp: React.FC<
  PAnimCompProps & React.SVGAttributes<SVGGElement>
> = ({ parserOut, childrenProps, aAttr, id, animProps }) => {
  return (
    <animated.g id={id} {...animProps}>
      <ParserComp
        parserOut={parserOut}
        childrenProps={childrenProps}
        pgroupAttr={aAttr}
      />
    </animated.g>
  );
};

// export const Anim: React.FC<React.SVGAttributes<SVGGElement>> = (props) => {
//   return <g {...props}></g>;
// };

interface LatexAnim {
  Anim: typeof PanimComp;
}
Latex.Anim = PanimComp;

export default Latex;
