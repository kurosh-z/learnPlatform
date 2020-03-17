import React, { useMemo } from 'react';
import Symb, { symbols } from './Symb';

type SymbsProps = {
  symbs: string;
  dx?: number;
  dy?: number;
  style?: React.CSSProperties;
  className?: string;
};
const Symbs: React.FC<SymbsProps> = ({
  symbs,
  dx,
  dy,
  className,
  children,
  ...rest
}) => {
  if (children) throw new Error('symbs element accepts no children!');
  const mathexprArr = useMemo(() => calExpresions(symbs), [symbs]);

  return (
    <>
      {mathexprArr.map(({ expr, type }, idx: number) => {
        return idx === 0 ? (
          <tspan
            key={idx}
            dx={dx}
            dy={dy}
            className={className ? `${type} ${className}` : type}
            {...rest}>
            {expr}
          </tspan>
        ) : (
          <tspan
            key={idx}
            className={className ? `${type} ${className}` : type}
            {...rest}>
            {expr}
          </tspan>
        );
      })}
    </>
  );
};
export default Symbs;
type MathExprObj = { expr: string; type: string };
const calExpresions: (str?: string) => MathExprObj[] = str => {
  const regexp = new RegExp('\\\\[a-zA-Z@]+', 'g');
  // const str = '097\\beta23\\alpha65\\gamma';
  var nstr = str;
  // @ts-ignore
  const matches = str.matchAll(regexp);
  for (const match of matches) {
    // console.log(match[0], symbols[match[0]]);
    if (!symbols[match[0]]) throw new Error(`${match[0]} is not recognized!`);
    nstr = nstr.replace(match[0], symbols[match[0]]);
  }
  console.log('first ', nstr);
  const numRegexp = new RegExp('[0-9]+', 'g');
  let flag = true;
  var lastIndex = 0;
  var newIndex = 0;
  var tspandata: MathExprObj;
  const tspanArr = [];
  var expr: string, type: string;

  while (flag) {
    let match = numRegexp.exec(nstr);
    if (!match) {
      if (newIndex !== nstr.length) {
        tspandata = { expr: nstr.slice(newIndex, nstr.length), type: 'letter' };
        tspanArr.push(tspandata);
      }
      flag = false;
    } else {
      newIndex = numRegexp.lastIndex;
      expr = nstr.slice(lastIndex, match.index);
      type = isNumberString(expr) ? 'number' : 'letter';
      tspandata = { expr: expr, type: type };
      tspanArr.push(tspandata);
      //second part
      expr = nstr.slice(match.index, newIndex);
      type = isNumberString(expr) ? 'number' : 'letter';
      tspandata = { expr: expr, type: type };
      tspanArr.push(tspandata);

      lastIndex = newIndex;
    }
  }
  if (tspanArr[0]['expr'] === '') tspanArr.shift();
  console.log(tspanArr);
  return tspanArr;
};

const isNumberString: (str: string) => boolean = str => {
  const regexpr = /^-?(\d+\.?\d*)$|(\d*\.?\d+)$/;
  return regexpr.test(str);
};
