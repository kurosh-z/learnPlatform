import React, { useLayoutEffect, useRef, useMemo } from 'react';
import mathsymbols from './mathsymbols';
const getStringWidth = mathsymbols.getStringWidth;
type CompsWidth = number[];
const Text: React.RefForwardingComponent<
  SVGTextElement,
  {
    x: number;
    y: number;
    expr: string;
    className?: string;
    compId: number;
    setCompsWidth: React.Dispatch<React.SetStateAction<CompsWidth>>;
  }
> = React.forwardRef(
  ({ expr, x, y, className, compId, setCompsWidth }, ref: any) => {
    // const textRef = useRef<SVGTextElement>(null);
    // useLayoutEffect(() => {
    //   if (textRef.current) {
    //     const { width } = textRef.current.getBBox();
    //     setCompsWidth(widthArr => {
    //       if (widthArr.length >= compId) widthArr[compId] = width;
    //       else widthArr.push(width);
    //       return widthArr;
    //     });
    //   }
    // }, [textRef.current]);
    useMemo(() => {
      const width = getStringWidth(expr);
      setCompsWidth(widthArr => {
        if (widthArr.length >= compId) widthArr[compId] = width;
        else widthArr.push(width);
        return widthArr;
      });
      console.log('changed');
    }, [expr]);

    return (
      <text
        x={x}
        y={y}
        // ref={el => {
        //   textRef.current = el;
        // }}
        className={className}>
        {expr}
      </text>
    );
  }
);

export default Text;
