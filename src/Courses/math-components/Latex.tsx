import React, { useMemo, useEffect, useLayoutEffect, useState } from 'react';
import mathSymols from './mathsymbols';
import Parser, { CompProps } from './Parser';
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
  // const mathexprArr = useMemo(() => calExpresions(symbs), [symbs]);
  // const refs = useRef<SVGGElement[]>([]);
  // refs.current = [];
  // const addToRefs = el => {
  //   if (el && !refs.current.includes(el)) {
  //     refs.current.push(el);
  //   }
  // };
  const compPrompList = useMemo(() => {
    const parser = new Parser(math, x);
    const compPrompList = parser.exprToComponents();
    return compPrompList;
  }, [math]);

  const [compsWidth, setCompsWidth] = useState<number[]>([]);

  const [length, setLength] = useState<number>(1);

  useEffect(() => {
    console.log('useEffect', compsWidth);
    setLength(() => compsWidth.length + 1);
  }, [compsWidth, compsWidth.length]);

  var lastPos = x;
  return (
    <>
      {compPrompList
        .slice(0, length === 0 ? 1 : length)
        .map((compProp, idx: number) => {
          let Comp = compProp.component;
          let props = compProp.props;
          let dx = idx === 0 ? 0 : compsWidth[idx - 1];
          // console.log('compwidth,', idx - 1, compsWidth[`{idx-1}`]);
          let posX = lastPos + dx;
          // console.log('comp, pos', props);
          lastPos = posX;
          return (
            <Comp
              key={idx}
              x={posX}
              y={y}
              {...props}
              compId={idx}
              setCompsWidth={setCompsWidth}
            />
          );
        })}
    </>
  );
};

export default Latex;
