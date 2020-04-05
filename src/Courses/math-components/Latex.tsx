import React, { useMemo } from 'react';

import MathCss from './MathCss';
import parserFactory, { CookedMathExpr } from './Parser';

type SymbsProps = {
  math: string;
  x: number;
  y: number;
  style?: React.CSSProperties;
  letterSpacing?: number;
  className?: string;
};

type Gobj = {
  open: boolean;
  gElements: CookedMathExpr[];
  gattrs: CookedMathExpr['attr'];
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

  const gobjList: Gobj[] = [];
  const { mathExprList, mathcss } = useMemo(() => {
    const mathcss = new MathCss(1.2);
    const parser = parserFactory({
      str: math,
      pfontSizes: mathcss.fontSizes,
    });

    const mathExprList = parser.cookedMathExprList;
    return { mathExprList, mathcss };
  }, [math]);

  return (
    <g css={mathcss.css} transform={`translate(${x} ${y})`}>
      {mathExprList.map((mathexpr, idx: number) => {
        const { expr, attr } = mathexpr;
        if (expr === 'CREATE_GROUP') {
          const gObj: Gobj = { open: true, gElements: [], gattrs: attr };
          gobjList.push(gObj);
        } else if (expr === 'CLOSE_GROUP') {
          let lastIdx = gobjList.length - 1;
          gobjList[lastIdx].open = false;
          // consume the last group
          const gEl = gobjList[lastIdx];
          gobjList.pop();

          return (
            <SvgGroup
              groupElList={gEl.gElements}
              gattrs={gEl.gattrs}
              key={idx}
            />
          );
        } else if (gobjList.length !== 0) {
          const lastIdx = gobjList.length - 1;
          if (gobjList[lastIdx].open)
            gobjList[lastIdx].gElements.push(mathexpr);
        } else {
          return (
            <text {...attr} key={idx}>
              {expr}
            </text>
          );
        }
      })}
    </g>
  );
};

export default Latex;

const SvgGroup = ({
  groupElList,
  gattrs,
}: {
  groupElList: CookedMathExpr[];
  gattrs: CookedMathExpr['attr'];
}) => {
  return (
    <g {...gattrs}>
      {groupElList.map((mathexpr, idx: number) => {
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
