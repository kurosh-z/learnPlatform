import { patternFactory, MathExpr, SscriptPattern } from './Pattern';
import mathsymbols from './mathsymbols';
const getStringWidth = mathsymbols.getStringWidth;
const allPatterns = [patternFactory('sScript')];
const atomPatterns = [patternFactory('atom')];
// export type CompProps = {
//   component: React.RefForwardingComponent<any, any>;
//   props: Object;
// };
export type CookedMathExpr = {
  expr: string;
  attr: { x: number; y: number; className: string };
};
type ParserArgs = {
  str: string;
  x?: number;
  y?: number;
};
export default class Parser {
  str: string;
  currStr: string;
  patternList: typeof allPatterns = allPatterns;
  atomPatternsList: typeof atomPatterns = atomPatterns;
  allRegStrings: string;
  allAtomRegStrings: string;
  rawMathExprList: MathExpr[] = [];
  currPos: { currX: number; currY: number };
  currClassName: string;
  cookedMathExprList: CookedMathExpr[] = [];

  constructor({ str, x = 0, y = 0 }: ParserArgs) {
    this.str = str;
    this.currPos = { currX: x, currY: y };
    this.allRegStrings = this._makeAllregStrings(this.patternList);
    this.allAtomRegStrings = this._makeAllregStrings(this.atomPatternsList);
  }
  _makeAllregStrings(patternList: typeof allPatterns | typeof atomPatterns) {
    let allRegStrings = '';
    var idx = 0;
    for (const pattern of patternList) {
      if (idx === 0) allRegStrings = pattern.regString;
      else {
        allRegStrings += '|' + pattern.regString;
      }
      idx++;
    }
    return allRegStrings;
  }
  whitchPattern(
    expr: string,
    patternList: typeof allPatterns | typeof atomPatterns
  ) {
    let matchingPattern;
    for (const pattern of patternList) {
      if (pattern.isPattern(expr)) return pattern;
    }
    if (!matchingPattern) throw new Error(`expr containts no latex code!`);
  }
  consume(expr: string, startingIndex: number) {
    // console.log('consume', startingIndex, expr);
    const reducedExpr = expr.slice(startingIndex, expr.length);
    return reducedExpr;
  }
  _handleAtoms(str: string) {
    const regexAll = new RegExp(this.allAtomRegStrings, 'mg');
    const match = regexAll.exec(str);
    if (!match || match.index !== 0) {
      throw new Error(`expr: ${str} is not latex`);
    }
    const pattern = this.whitchPattern(match[0], this.atomPatternsList);
    pattern.strToMathExpr(str, match.index);
    const mathexprList = pattern.mathExpressions;
    for (const mathexpr of mathexprList) {
      const { expr, attr } = mathexpr;
      const { dx, dy, className } = attr;
      let { currX, currY } = this.currPos;
      currX += dx;
      currY += dy;
      const coockedmathExpr: CookedMathExpr = {
        expr: expr,
        attr: {
          x: currX,
          y: currY,
          className: this.currClassName + ' ' + className
        }
      };
      this.cookedMathExprList.push(coockedmathExpr);
      const exprWidth = getStringWidth(expr);
      currX += exprWidth;
      // console.log('atom', expr);
      // console.log('width', exprWidth);
      // console.log('before widht', this.currPos.currX);
      this.currPos = { currX, currY };
      // console.log('after width', this.currPos.currX);
      // console.log('-----------------');
    }
    str = this.consume(str, pattern.endingIndex);
    return str;
  }

  strToMathExpressions(str: string) {
    let nstr = str;
    let idx = 0;

    while (nstr.length !== 0) {
      const regexAll = new RegExp(this.allRegStrings, 'mg');
      const match = regexAll.exec(nstr);
      if (!match || match.index !== 0) {
        nstr = this._handleAtoms(nstr);
        console.log('parserStr', this.str);
        console.log('str: ', str);
        console.log('nstr', nstr);
        console.log('------------------------');
      } else {
        const pattern = this.whitchPattern(match[0], this.patternList);
        pattern.strToMathExpr(nstr, match.index);
        // nstr = nstr.slice(pattern.endingIndex, nstr.length);
        nstr = this.consume(nstr, pattern.endingIndex);
        console.log('parserStr', this.str);
        console.log('str: ', str);
        console.log('nstr', nstr);
        console.log('------------------------');
        this._handleNonAtoms(pattern);
        // TODO: correct the types _handleNoneAtoms should recieve!
      }
      idx++;

      if (idx > str.length || idx > 200)
        //TODO: remove idx>100
        throw new Error(`parsing loop is not stable!`);
    }
  }

  _handleNonAtoms(pattern: SscriptPattern) {
    if (pattern.isParallel()) this._handleParallel(pattern);
    else {
      for (const mathExpr of pattern.mathExpressions) {
        const { currX, currY } = this.currPos;
        const parser = parserFactory({
          str: mathExpr.expr,
          x: currX + mathExpr.attr.dx,
          y: currY + mathExpr.attr.dy
        });

        for (const cookedMathExpr of parser.cookedMathExprList) {
          this.cookedMathExprList.push(cookedMathExpr);
        }
        this.currPos.currX = parser.currPos.currX;
      }
    }
  }

  _handleParallel(pattern: SscriptPattern) {
    const baseExpr = pattern.mathExpressions[0]; ///base expresion how to handle?
    const index1Expr = pattern.mathExpressions[1];
    const index2Expr = pattern.mathExpressions[2];
    let { currX, currY } = this.currPos;

    const parser0 = parserFactory({
      str: baseExpr.expr,
      x: currX + baseExpr.attr.dx,
      y: currY + baseExpr.attr.dy
    });
    for (const cookedMathExpr of parser0.cookedMathExprList) {
      this.cookedMathExprList.push(cookedMathExpr);
    }
    this.currPos = parser0.currPos;
    // TODO: should here just set the currX or not?

    const parser1 = parserFactory({
      str: index1Expr.expr,
      x: this.currPos.currX + index1Expr.attr.dx,
      y: this.currPos.currY + index1Expr.attr.dy
    });

    const parser2 = parserFactory({
      str: index2Expr.expr,
      x: this.currPos.currX + index2Expr.attr.dx,
      y: this.currPos.currY + index2Expr.attr.dy
    });

    for (const cookedMathExpr of parser1.cookedMathExprList) {
      this.cookedMathExprList.push(cookedMathExpr);
    }
    for (const cookedMathExpr of parser2.cookedMathExprList) {
      this.cookedMathExprList.push(cookedMathExpr);
    }
    const currX1 = parser1.currPos.currX;
    const currX2 = parser2.currPos.currX;
    //push results of parser1 and parser2 to to the list
    this.currPos.currX = currX1 >= currX2 ? currX1 : currX2;
  }
  parse() {
    let str = this.str;
    this.strToMathExpressions(str);
    return this.cookedMathExprList;
  }
}

export function parserFactory({ str, x, y }: ParserArgs) {
  const parser = new Parser({ str, x, y });
  parser.parse();
  return parser;
}
