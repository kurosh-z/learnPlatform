// import React, { useMemo, useRef } from 'react';
// import mathSymols from './mathsymbols';
// import Parser from './Parser';
// const parser = new Parser('ab2 r_{k_{vd}^{las}}');

// const getlatexSymbol = mathSymols.getlatexSymbol;
// const getStringWidth = mathSymols.getStringWidth;
// const greekKeys = mathSymols.getGreekKeys();
// type SymbsProps = {
//   symbs: string;
//   x: number;
//   y: number;
//   style?: React.CSSProperties;
//   letterSpacing?: number;
//   className?: string;
// };
// const Symbs: React.FC<SymbsProps> = ({
//   symbs,
//   x,
//   y,
//   className,
//   children,
//   letterSpacing = 0.5,
//   ...rest
// }) => {
//   if (children) throw new Error('symbs element accepts no children!');
//   // const mathexprArr = useMemo(() => calExpresions(symbs), [symbs]);
//   const mathcharArr = useMemo(() => exprTotspanData(symbs), [symbs]);

//   var lastPos = x;

//   return (
//     // <text x={100} y={100}>
//     <>
//       {mathcharArr.map(({ expr, type }, idx: number) => {
//         lastPos +=
//           idx === 0
//             ? 0
//             : getStringWidth(mathcharArr[idx - 1]['expr']) + letterSpacing;

//         // console.log(expr, lastPos);
//         return idx === 0 ? (
//           <text
//             transform={`translate(${lastPos} ${y})`} // TODO: decide btw. translate or x,y attributes
//             key={idx}
//             className={className ? `${type} ${className}` : type}
//             {...rest}>
//             {expr}
//           </text>
//         ) : (
//           <text
//             key={idx}
//             x={lastPos}
//             y={y}
//             className={className ? `${type} ${className}` : type}
//             {...rest}>
//             {expr}
//           </text>
//         );
//       })}
//     </>
//     // </text>
//   );
// };
// export default Symbs;

// /*  parsing the string to find  symbols:

// */
// type MathExprObj = { expr: string; type: string };

// const isNumberString: (str: string) => boolean = str => {
//   const regexpr = /^-?(\d+\.?\d*)$|(\d*\.?\d+)$/;
//   return regexpr.test(str);
// };

// const isLetter: (str: string) => boolean = str => {
//   const regexpr = /^[a-zA-Z@αβγΓδΔϵζηθΘιIκλΛμνοπΠρσΣτυϕΦχΞξψΨω]+$/;

//   return regexpr.test(str);
// };
// type Tspandata = { type: 'letter' | 'number' | ''; expr: string };

// const exprTotspanData: (str: string) => MathExprObj[] = str => {
//   var nstr = str;
//   // first change latex symbols to theier actual symbols
//   const latexRegexpr = /\\[a-zA-Z@]+/gm;
//   var m: RegExpExecArray;
//   // in whihle condition we use str instead of nstr cuase we want to change nstr!
//   // otherwise lastIndex changes every time we change nstr!
//   while ((m = latexRegexpr.exec(str)) !== null) {
//     if (m.index === latexRegexpr.lastIndex) {
//       latexRegexpr.lastIndex++;
//     }

//     m.forEach(match => {
//       nstr = nstr.replace(match, getlatexSymbol(match));
//     });
//   }

//   // then seperate numbers and letters

//   var lastIndex = 0;
//   var newIndex = 0;
//   var numMatch;

//   var tspanArr: Tspandata[] = [];
//   var expr: string, type: string;
//   const numRegexp = /[0-9.]+/gm;
//   let flag = true;
//   while (flag) {
//     numMatch = numRegexp.exec(nstr);
//     if (!numMatch) {
//       if (lastIndex !== nstr.length) {
//         expr = nstr.slice(lastIndex, nstr.length);
//         manageTypes2(expr, tspanArr);
//       }
//       flag = false;
//     } else {
//       newIndex = numRegexp.lastIndex;
//       expr = nstr.slice(lastIndex, numMatch.index);
//       manageTypes2(expr, tspanArr);
//       expr = nstr.slice(numMatch.index, newIndex);
//       manageTypes2(expr, tspanArr);
//       lastIndex = newIndex;
//     }
//   }
//   return tspanArr;
// };

// // seperate letters form numbers
// const manageTypes2 = (expr: string, tspanArr: Tspandata[]) => {
//   var tspandata: Tspandata;
//   var type: Tspandata['type'];
//   // if the whole expr is number or letters we already know the type of individual chars
//   if (isLetter(expr)) type = 'letter';
//   else if (isNumberString(expr)) type = 'number';
//   if (type === 'letter' || type === 'number') {
//     const chars = expr.split('');
//     for (const char of chars) {
//       tspandata = { expr: char, type: type };
//       tspanArr.push(tspandata);
//     }
//   }
//   // if its not just numbers or letters we check individual chars to determine the type
//   else {
//     const chars = expr.split('');
//     for (const char of chars) {
//       if (isLetter(char)) type = 'letter';
//       else if (isNumberString(char)) type = 'number';
//       else type = '';
//       tspandata = { expr: char, type: type };
//       tspanArr.push(tspandata);
//     }
//   }
// };
