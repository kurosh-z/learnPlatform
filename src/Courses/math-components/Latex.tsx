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

type LatexGroup = {
  open: boolean;
  gElements: CookedMathExpr[];
  gattrs: CookedMathExpr['attr'];
  numOpenChildGroups: number;
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

  const groupList: LatexGroup[] = [];
  const { mathExprList, mathcss } = useMemo(() => {
    const mathcss = new MathCss(1);
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
          if (groupList.length !== 0) {
            var lastIdx = groupList.length - 1;
            var isLastOpen = groupList[lastIdx].open;
          }
          // if last goup is closed or there is still no group create one
          if (groupList.length === 0 || !isLastOpen) {
            const group: LatexGroup = {
              open: true,
              gElements: [],
              gattrs: attr,
              numOpenChildGroups: 0,
            };
            groupList.push(group);
          }
          // otherwise push the goup as an element for the exsiting open group
          else {
            groupList[lastIdx].gElements.push(mathexpr);
            groupList[lastIdx].numOpenChildGroups += 1;
          }
        } else if (expr === 'CLOSE_GROUP') {
          var lastIdx = groupList.length - 1;
          var numChild = groupList[lastIdx].numOpenChildGroups;
          if (numChild !== 0) {
            groupList[lastIdx].numOpenChildGroups += -1;
            groupList[lastIdx].gElements.push(mathexpr);
          } else {
            groupList[lastIdx].open = false;
            // consume the last group
            const groupEl = groupList[lastIdx];
            groupList.pop();

            return (
              <SvgGroup
                mathExprList={groupEl.gElements}
                gattrs={groupEl.gattrs}
                key={idx}
              />
            );
          }
        } else if (groupList.length !== 0) {
          const lastIdx = groupList.length - 1;
          if (groupList[lastIdx].open)
            groupList[lastIdx].gElements.push(mathexpr);
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
  mathExprList,
  gattrs,
}: {
  mathExprList: CookedMathExpr[];
  gattrs: CookedMathExpr['attr'];
}) => {
  const groupList: LatexGroup[] = [];
  return (
    <g {...gattrs}>
      {mathExprList.map((mathexpr, idx: number) => {
        const { expr, attr } = mathexpr;
        if (expr === 'CREATE_GROUP') {
          if (groupList.length !== 0) {
            var lastIdx = groupList.length - 1;
            var isLastOpen = groupList[lastIdx].open;
          }
          // if last goup is closed or there is still no group create one
          if (groupList.length === 0 || !isLastOpen) {
            const group: LatexGroup = {
              open: true,
              gElements: [],
              gattrs: attr,
              numOpenChildGroups: 0,
            };
            groupList.push(group);
          }
          // otherwise push the goup as an element for the exsiting open group
          else {
            groupList[lastIdx].gElements.push(mathexpr);
            groupList[lastIdx].numOpenChildGroups += 1;
          }
        } else if (expr === 'CLOSE_GROUP') {
          var lastIdx = groupList.length - 1;
          var numChild = groupList[lastIdx].numOpenChildGroups;
          if (numChild !== 0) {
            groupList[lastIdx].numOpenChildGroups += -1;
            groupList[lastIdx].gElements.push(mathexpr);
          } else {
            groupList[lastIdx].open = false;
            // consume the last group
            const groupEl = groupList[lastIdx];
            groupList.pop();

            return (
              <SvgGroup
                mathExprList={groupEl.gElements}
                gattrs={groupEl.gattrs}
                key={idx}
              />
            );
          }
        } else if (groupList.length !== 0) {
          const lastIdx = groupList.length - 1;
          if (groupList[lastIdx].open)
            groupList[lastIdx].gElements.push(mathexpr);
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
