import React, { useMemo, ReactElement } from 'react';
import { animated } from 'react-spring';
import { MathCss, parserFactory } from './parser';
import Parser, { ParserOutputList, ParserOutput, PBBox } from './parser/Parser';
import { useLatexBBox } from './LatexContext';

type useParserArgs = {
  mathFormula: string;
  fontFactor: number;
  latexId: string;
};

function useParser({
  mathFormula,
  fontFactor,
  latexId,
}: useParserArgs): { parser: Parser; mathcss: MathCss } {
  const [, setLatexBBox] = useLatexBBox();
  const { parser, mathcss } = useMemo(() => {
    const mathcss = new MathCss(fontFactor);
    const parser = parserFactory({
      str: mathFormula,
      fontSizegetter: mathcss.getfontSizeFunc(),
    });

    setLatexBBox({ latexId, bbox: parser.BBox });

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
  latexId: string;
};

const Latex: React.FC<LatexProps> & LatexAnim = ({
  mathFormula,
  x,
  y,
  children,
  fontFactor = 2,
  style,
  latexId,
}) => {
  const { parser, mathcss } = useParser({ mathFormula, fontFactor, latexId });

  const parserOutput = parser.outputs;

  const { top, bottom, right, left, height, width } = parser.BBox;
  const topsign: ParserOutput<'Pdelimiter'> = {
    component: 'delimiter',
    dtype: 'check_line',
    dattr: { transform: `translate(${right} ${top})` },
  };

  // const bottomsign: ParserOutput<'Pdelimiter'> = {
  //   component: 'delimiter',
  //   dtype: 'check_line',
  //   dattr: { transform: `translate(${left} ${bottom})` },
  // };
  // const widthsign: ParserOutput<'Pdelimiter'> = {
  //   component: 'delimiter',
  //   dtype: 'hline',
  //   dattr: { transform: `translate(${0} ${90})`, width: width },
  // };
  const bbox: ParserOutput<'Pdelimiter'> = {
    component: 'delimiter',
    dtype: 'bbox',
    dattr: { bbox: { top, bottom, left, right } },
  };
  // parserOutput.push(bbox);
  const childrenProps = useMemo(() => {
    const childrenProps: LatexChildrenProps = {};

    if (children) {
      React.Children.map(children, (child: React.ReactElement) => {
        if (typeof child === 'string') {
          throw new Error('expected Latex.Anim as children recevied string');
        }
        const props = child.props;
        const id = props.id;

        Object.defineProperty(childrenProps, id, {
          value: child,
          enumerable: true,
        });
      });
    }
    return childrenProps;
  }, [children]);

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
  [id: string]: ReactElement;
};
type ParserCompProps = {
  parserOut: ParserOutputList;
  pgroupAttr?: ParserOutput<'PGroup'>['gattr'];
  childrenProps: LatexChildrenProps;
};

// const ParserComp: React.RefForwardingComponent<SVGGElement, ParserCompProps> = (
//   { parserOut, pgroupAttr, childrenProps },
//   ref
// ) => {
// }
const ParserComp2: React.FC<ParserCompProps> = (
  { parserOut, pgroupAttr, childrenProps },
  ref
) => {
  return (
    <animated.g {...pgroupAttr} ref={ref}>
      {parserOut.map((output, idx: number) => {
        const { component } = output;
        if (component === 'text') {
          const { attr, mathExpr, tspans } = output as ParserOutput<'Ptext'>;
          return (
            <text key={idx} {...attr}>
              {mathExpr && mathExpr}
              {tspans &&
                tspans.map(
                  (tspan: ParserOutput<'Ptext'>['tspans'][0], j: number) => {
                    return (
                      <tspan key={j} {...tspan.tattr}>
                        {tspan.texpr}
                      </tspan>
                    );
                  }
                )}
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
          const animChild = childrenProps[id];
          return (
            <PanimComp
              key={idx}
              parserOut={animElements}
              id={id}
              aAttr={aAttr}
              childrenProps={childrenProps}
              animProps={animChild.props}
              ref={animChild.ref}
            />
          );
        }
      })}
    </animated.g>
  );
};
const ParserComp = React.forwardRef(ParserComp2);

type DelimiterProps = {
  dattr: ParserOutput<'Pdelimiter'>['dattr'];
  dtype: ParserOutput<'Pdelimiter'>['dtype'];
};

const DelimiterComp: React.FC<DelimiterProps> = ({ dattr, dtype }) => {
  const { transform, text, className, thickness } = dattr;
  const path = DELIMITER_PATH[dtype](dattr);

  const classNames = className ? dtype + ' ' + className : dtype;

  return (
    <>
      <path
        className={classNames}
        d={path}
        transform={transform}
        strokeWidth={thickness ? thickness : 0.7}
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
  bracket_open: (dattr) => {
    const { height, thickness } = dattr;
    return `M8 -${height / 2} h-${7 * thickness} v${height} h${7 * thickness} `;
  },
  bracket_close: (dattr) => {
    const { height, thickness } = dattr;
    return `M-8 -${height / 2} h${7 * thickness} v${height} h-${7 * thickness}`;
  },
  arrow: () => `M 0 0 h 6 l -2.3 -1.5 m 2.3 1.5 l -2.3 1.5`,
  check_line: () => `M-10 0 h20 m-10 -10 v20 `,
  bbox: (dattr) => {
    const { left, right, top, bottom } = dattr.bbox;
    return `M${left} ${bottom} h${right - left} v${-bottom + top} h${
      left - right
    } v${bottom - top}`;
  },
  hline: (dattr) => {
    const { width } = dattr;
    return `m0 0 h${width}`;
  },
};

type PAnimCompProps = {
  parserOut?: ParserOutputList;
  childrenProps?: LatexChildrenProps;
  aAttr?: ParserOutput<'Panim'>['aAttr'];
  id: string;
  animProps?: React.SVGAttributes<SVGGElement>;
};

const PanimComp2: React.FC<
  PAnimCompProps & React.SVGAttributes<SVGGElement>
> = ({ parserOut, childrenProps, aAttr, animProps }, ref) => {
  // <animated.g id={id} {...animProps}>    </animated.g>

  return (
    <ParserComp
      parserOut={parserOut}
      childrenProps={childrenProps}
      pgroupAttr={{ ...aAttr, ...animProps }}
      ref={ref}
    />
  );
};
const PanimComp = React.forwardRef(PanimComp2);
interface LatexAnim {
  Anim: typeof PanimComp;
}
Latex.Anim = PanimComp;

export default Latex;
