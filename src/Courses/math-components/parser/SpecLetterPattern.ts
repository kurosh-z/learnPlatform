// import Pattern, { MathExpr, PatternArgs } from './Pattern';
// import mathssymbols from './mathsymbols';
// const GREEK_CHARS = mathssymbols.GreekChars;
// const GREEK_KEYS = mathssymbols.getGreekKeys();

// export default class SpecLetterPattern extends Pattern {
//   endingIndex: number;
//   stratingIndex: number;
//   regString: string;
//   mathExpressions: MathExpr[];
//   stringsRest: string;
//   constructor({ name }: PatternArgs) {
//     super({ name });
//     const regStrs = this._createRegStrings('GREEK_CHAR');

//     this.regString = regStrs;
//   }
//   private _createRegStrings(regType: 'GREEK_CHAR' | 'MATH_OP') {
//     let keyList: string[];
//     if (regType === 'GREEK_CHAR') {
//       let greekkeylist = GREEK_KEYS.split(/\\/gm);
//       keyList = greekkeylist.slice(1, greekkeylist.length);
//     }
//     // else {
//     //   keyList = [];
//     //   for (const key in MATH_OP) {
//     //     keyList.push(key.split('\\')[1]);
//     //   }
//     // }

//     let regStr = '(\\\\)(';
//     let idx = 0;
//     for (const expr of keyList) {
//       if (idx === 0) {
//         regStr += '(' + expr + ')';
//       } else {
//         regStr += '|(' + expr + ')';
//       }
//       idx++;
//     }
//     regStr += ')';

//     return regStr;
//   }

//   isParallel() {
//     return false;
//   }
//   isPattern(str: string) {
//     const regexp = new RegExp(this.regString, 'mg');
//     return regexp.test(str);
//   }

//   strToMathExpr(str: string) {
//     const regexp = new RegExp(this.regString, 'gm');
//     const match = regexp.exec(str);
//     this.stratingIndex = match.index;

//     let expr: string;

//     if (match[0] in GREEK_CHARS) {
//       expr = GREEK_CHARS[match[0]];
//     } else if (match[0] in MATH_OP) {
//       expr = MATH_OP[match[0]];
//     }

//     this.endingIndex = regexp.lastIndex;
//     this.stringsRest = this.consume(str, this.endingIndex);

//     this.mathExpressions = [
//       {
//         expr: expr,
//         attr: { className: '', dx: 0, dy: 0, fontKey: this.fontKey },
//       },
//     ];
//   }
// }
