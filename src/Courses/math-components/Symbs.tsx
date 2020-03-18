import React, { useMemo } from 'react';
import Symb, { symbols } from './Symb';
import { symbolBankString } from './mathsymbols';
type SymbsProps = {
  symbs: string;
  dx?: number;
  dy?: number;
  style?: React.CSSProperties;
  letterSpacing?: number;
  className?: string;
};
const Symbs: React.FC<SymbsProps> = ({
  symbs,
  dx,
  dy,
  className,
  children,
  letterSpacing,
  ...rest
}) => {
  if (children) throw new Error('symbs element accepts no children!');
  const mathexprArr = useMemo(() => calExpresions(symbs), [symbs]);
  // calExpresions2(symbs);
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
            letterSpacing={letterSpacing ? letterSpacing : null}
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

const isNumberString: (str: string) => boolean = str => {
  const regexpr = /^-?(\d+\.?\d*)$|(\d*\.?\d+)$/;
  return regexpr.test(str);
};

type Tspandata = { type: 'letter' | 'number'; expr: string };
const calExpresions: (str: string) => MathExprObj[] = str => {
  var nstr = str;
  // first change latex symbols to theier actual symbols
  const latexRegexpr = /\\[a-zA-Z@]+/gm;
  var m: RegExpExecArray;
  // in whihle condition we use str instead of nstr cuase we want to change nstr!
  // otherwise lastIndex changes every time we change nstr!
  while ((m = latexRegexpr.exec(str)) !== null) {
    if (m.index === latexRegexpr.lastIndex) {
      latexRegexpr.lastIndex++;
    }

    m.forEach(match => {
      if (!symbols[match])
        throw new Error(`symbol ${match} is not recognized!`);
      nstr = nstr.replace(match, symbols[match]);
    });
  }
  // then seperate numbers and letters

  var lastIndex = 0;
  var newIndex = 0;
  var numMatch;

  var tspanArr: Tspandata[] = [];
  var expr: string, type: string;
  const numRegexp = /[0-9.]+/gm;
  let flag = true;
  while (flag) {
    numMatch = numRegexp.exec(nstr);
    if (!numMatch) {
      flag = false;
      //you shoul still add to array
    } else {
      newIndex = numRegexp.lastIndex;
      expr = nstr.slice(lastIndex, numMatch.index);
      manageTypes(expr, tspanArr);
      expr = nstr.slice(numMatch.index, newIndex);
      manageTypes(expr, tspanArr);
      lastIndex = newIndex;
    }
  }
  return tspanArr;
};

// seperate letters form numbers push number as a whole and letters seperatly to the tspanArr
const manageTypes = (expr: string, tspanArr: Tspandata[]) => {
  let type = isNumberString(expr) ? 'number' : 'letter';
  var tspandata: Tspandata;
  // console.log(expr, type);
  if (type === 'number') {
    tspandata = { expr: expr, type: type };
    tspanArr.push(tspandata);
  } else if (type === 'letter') {
    const chars = expr.split('');
    for (const char of chars) {
      tspandata = { expr: char, type: 'letter' };
      tspanArr.push(tspandata);
    }
  }
};

// const seperateLetters = (str: string) => {
//   const regExpString = `[a-zA-Z@]+[ \r\n\t]*|[${symbolBankString}]+[ \r\n\t]*`;
//   const regExp = new RegExp(regExpString, 'gm');
//   const chars: string[] = [];
//   var flag = true;
//   while (flag) {
//     let match = regExp.exec(str);
//     if (!match) {
//       flag = false;
//     } else {
//       chars.push(match[0]);
//     }
//   }
// };
