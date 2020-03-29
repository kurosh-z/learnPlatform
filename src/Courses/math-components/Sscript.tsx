import React, { useRef, useLayoutEffect, useState } from 'react';
import Latex from './Latex';

export type IndexString = {
  expr: string;
  indexType: 'subscript' | 'supscript';
};
type CompsWidth = number[];
const Sscript: React.RefForwardingComponent<
  SVGGElement,
  {
    base: string;
    indexStrings: IndexString[];
    x: number;
    y: number;
    className?: string;
    compId: number;
    setCompsWidth: React.Dispatch<React.SetStateAction<CompsWidth>>;
  }
> = React.forwardRef(
  ({ base, indexStrings, x, y, compId, setCompsWidth }, ref: any) => {
    const gRef = useRef<SVGGElement>(null);
    const baseRef = useRef<SVGGElement>(null);
    const [indexX, setIndexX] = useState(x);
    useLayoutEffect(() => {
      if (baseRef.current) {
        const width = baseRef.current.getBBox().width;
        setIndexX(() => x + width);
      }
    }, [baseRef.current, indexStrings]); // base.Ref.current added here cause it's position is probably change in Latex component so that
    // index positions also should be updated!

    useLayoutEffect(() => {
      if (gRef.current) {
        const { width } = gRef.current.getBBox();
        setCompsWidth(widthArr => {
          if (widthArr.length >= compId) widthArr[compId] = width;
          else widthArr.push(width);
          return widthArr;
        });
        console.log(`sscript set width of ${base}group to : ${width}`);
        console.log(gRef.current);
      }
    }, [gRef.current]);

    return (
      <g className='sscript' ref={el => (gRef.current = el)}>
        <g ref={el => (baseRef.current = el)}>
          <Latex className='base' math={base} x={x} y={y} />
        </g>
        <g>
          {indexStrings.map((indexStr, idx) => {
            const expr = indexStr.expr;
            const exprType = indexStr.indexType;
            // console.log(expr, indexX);
            let indexY = exprType === 'subscript' ? y + 10 : y - 10;
            return (
              <Latex math={expr} x={indexX} y={indexY} key={`subp${idx}`} />
            );
          })}
        </g>
      </g>
    );
  }
);

export default Sscript;
