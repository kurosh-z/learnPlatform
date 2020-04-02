import { patternFactory, MathExpr, SscriptPattern } from './Pattern';
import mathsymbols from './mathsymbols';
import { FontSizesType } from './mathCss';

const getStringWidth = mathsymbols.getStringWidth;
// TODO: right now I use just one instance of pattern object for everything pay attention to the confilicts it my couse!
//       any default values there should be considred as potential risk!

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
  baseFont?: keyof FontSizesType;
  configs: PConfigs;
};
class Parser {
  str: string;
  currStr: string;
  baseFont: keyof FontSizesType;
  configs: PConfigs;
  fontSizes: FontSizesType;
  patternList: PConfigs['allPatterns'];
  atomPatternsList: PConfigs['atomPatterns'];
  allRegStrings: string;
  allAtomRegStrings: string;
  rawMathExprList: MathExpr[] = [];
  currPos: { currX: number; currY: number };
  cookedMathExprList: CookedMathExpr[] = [];

  constructor({
    str,
    x = 0,
    y = 0,
    configs,
    baseFont = 'normalsize'
  }: ParserArgs) {
    this.str = str;
    this.configs = configs;
    this.fontSizes = this.configs.fontSizes;
    this.patternList = this.configs.allPatterns;
    this.atomPatternsList = this.configs.atomPatterns;
    this.baseFont = baseFont;
    this.currPos = { currX: x, currY: y };
    this.allRegStrings = this._makeAllregStrings(this.patternList);
    this.allAtomRegStrings = this._makeAllregStrings(this.atomPatternsList);
  }
  _makeAllregStrings(
    patternList: PConfigs['allPatterns'] | PConfigs['atomPatterns']
  ) {
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
    patternList: PConfigs['allPatterns'] | PConfigs['atomPatterns']
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
        pattern.baseFont = this.baseFont;
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

      if (idx > str.length) throw new Error(`parsing loop is not stable!`);
    }
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
          className: className
        }
      };
      this.cookedMathExprList.push(coockedmathExpr);
      let font_size = this.fontSizes[this.baseFont];
      const exprWidth = getStringWidth(expr, font_size);
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
  // TODO: do something
  // _calFontSize(classNames: string) {
  //   let font_size = fontSizes['normalsize'];
  //   for (const font_key in fontSizes) {
  //     if (this._isExprInStr(font_key, classNames)) {
  //       font_size = fontSizes[font_key];
  //       break;
  //     }
  //   }
  //   return font_size;
  // }
  _handleNonAtoms(pattern: SscriptPattern) {
    if (pattern.isParallel()) this._handleParallel(pattern);
    else {
      for (const mathExpr of pattern.mathExpressions) {
        const { currX, currY } = this.currPos;
        // const parserFontFactor = this.fontFactor ===
        const parser = parserFactory({
          str: mathExpr.expr,
          x: currX + mathExpr.attr.dx,
          y: currY + mathExpr.attr.dy,
          baseFont: mathExpr.attr.fontKey
        });
        this._pushCookedMathExprList(parser.cookedMathExprList, mathExpr);
        this.currPos.currX = parser.currPos.currX;
      }
    }
  }

  _handleParallel(pattern: SscriptPattern) {
    let idx = 0;
    let paralleX = [];
    for (const mathExpr of pattern.mathExpressions) {
      const { currX, currY } = this.currPos;
      const parser = parserFactory({
        str: mathExpr.expr,
        x: currX + mathExpr.attr.dx,
        y: currY + mathExpr.attr.dy,
        baseFont: mathExpr.attr.fontKey
      });
      this._pushCookedMathExprList(parser.cookedMathExprList, mathExpr);
      if (idx === 0) {
        // if idx=0 it's base we have to update the currPos
        this.currPos.currX = parser.currPos.currX;
      } else {
        paralleX.push(parser.currPos.currX);
      }
      idx++;
    }
    // compare 2nd and last mathexprs and update currPos accordingly
    this.currPos.currX = paralleX[0] >= paralleX[1] ? paralleX[0] : paralleX[1];
  }

  // get the cookedMathExprList results from parser and the parent pattern of it
  // merge pattern's classNames with parser's classNames and push the cookedMathExpr
  _pushCookedMathExprList(
    cookedMathExprList: CookedMathExpr[],
    patternExpr: MathExpr
  ) {
    for (const cookedMathExpr of cookedMathExprList) {
      const mathexprClNames = cookedMathExpr.attr.className;
      const patternClName = patternExpr.attr.className;
      // console.log(cookedMathExpr.expr);
      // console.log('mathexpr :', mathexprClNames);
      // console.log('pattern  :', patternClName);
      const newClNames = this._updateClassName(mathexprClNames, patternClName);
      // console.log('newclName:', newClNames);
      // console.log('-------------------');
      cookedMathExpr.attr.className = newClNames;
      this.cookedMathExprList.push(cookedMathExpr);
    }
  }
  _isExprInStr(expr: string, str: string, range?: boolean) {
    const regexp = RegExp(expr, 'mg');
    if (range) {
      const match = regexp.exec(str);
      const test = match ? true : false;
      const startIdx = match ? match.index : null;
      const endIdx = match ? regexp.lastIndex : null;
      return { test, range: [startIdx, endIdx] };
    }
    return regexp.test(str);
  }
  _createReplacer(replaceStr: string) {
    return function() {
      return [replaceStr].join(' ');
    };
  }
  // find exprOld in str and replace it with exprNew
  _replaceStr(str: string, exprOld: string, exprNew: string) {
    let newStr = str.replace(
      new RegExp(exprOld, 'mg'),
      this._createReplacer(exprNew)
    );
    return newStr;
  }

  _updateClassName(currClassNames: string, newClassName: string) {
    let updatedClassNames: string = '';
    if (this._isExprInStr('math_letter', newClassName)) {
      updatedClassNames = this._replaceStr(
        currClassNames,
        'math_number',
        'math_letter'
      );
    } else if (this._isExprInStr('math_number', newClassName)) {
      updatedClassNames = this._replaceStr(
        currClassNames,
        'math_letter',
        'math_number'
      );
    } else if (
      this._isExprInStr('sub', newClassName) ||
      this._isExprInStr('sup', newClassName)
    ) {
      if (this._isExprInStr('scriptsize', currClassNames)) {
        updatedClassNames += ' ' + newClassName;
        updatedClassNames = this._replaceStr(
          currClassNames,
          'scriptsize',
          'tiny'
        );
      } else {
        updatedClassNames = currClassNames + ' ' + 'scriptsize';
      }
    } else {
      if (this._isExprInStr(newClassName, currClassNames))
        updatedClassNames = currClassNames;
      else {
        updatedClassNames = currClassNames + ' ' + newClassName;
      }
    }
    return updatedClassNames;
  }

  parse() {
    let str = this.str;
    this.strToMathExpressions(str);
    return this.cookedMathExprList;
  }
}

export default function parserFactory({
  str,
  x,
  y,
  baseFont,
  pfontSizes
}: Omit<ParserArgs, 'configs'> & { pfontSizes?: FontSizesType }) {
  const configs = pfontSizes
    ? PConfigs.getInstance(pfontSizes)
    : PConfigs.getInstance();

  const parser = new Parser({ str, x, y, baseFont, configs });
  parser.parse();
  return parser;
}

class PConfigs {
  fontSizes: FontSizesType;
  allPatterns;
  atomPatterns;
  public static instance: PConfigs;

  private constructor(fontSizes: FontSizesType) {
    this.fontSizes = fontSizes;
    this.allPatterns = [patternFactory('sScript', fontSizes)];
    this.atomPatterns = [
      patternFactory('math_letter', fontSizes),
      patternFactory('math_number', fontSizes)
    ];
  }
  public static getInstance(fontSizes?: FontSizesType) {
    if (!PConfigs.instance) {
      PConfigs.instance = new PConfigs(fontSizes);
    }
    return PConfigs.instance;
  }
  public getFontSizes() {
    return this.fontSizes;
  }
}
