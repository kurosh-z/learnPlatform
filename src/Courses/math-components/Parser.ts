import { patternFactory, MathExpr, SscriptPattern } from './Pattern';
import mathsymbols from './mathsymbols';
import { FontSizesType } from './mathCss';
// import './test.css';
const getStringWidth = mathsymbols.getStringWidth;
// TODO: right now I use just one instance of pattern object for everything pay attention to the confilicts it my couse!
//       any default values there should be considred as potential risk!

// export type CompProps = {
//   component: React.RefForwardingComponent<any, any>;
//   props: Object;
// };
export type CookedMathExpr = {
  expr: string;
  attr: { x?: number; y?: number; className?: string; transform?: string };
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
    baseFont = 'normalsize',
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
        // console.log('parserStr', this.str);
        // console.log('str: ', str);
        // console.log('nstr', nstr);
        // console.log('------------------------');
      } else {
        const pattern = this.whitchPattern(match[0], this.patternList);
        pattern.baseFont = this.baseFont;
        pattern.strToMathExpr(nstr, match.index);
        // nstr = nstr.slice(pattern.endingIndex, nstr.length);
        nstr = this.consume(nstr, pattern.endingIndex);
        // console.log('parserStr', this.str);
        // console.log('str: ', str);
        // console.log('nstr', nstr);
        // console.log('------------------------');
        this._handleNonAtoms(pattern);
        // TODO: correct the types _handleNoneAtoms should recieve!
      }
      idx++;

      if (idx > str.length) throw new Error(`parsing loop is not stable!`);
    }
  }
  _isAtom(str: string) {
    const regexAll = new RegExp(this.allAtomRegStrings, 'mg');
    return regexAll.test(str);
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
      const { dx, dy } = attr;
      let { currX, currY } = this.currPos;
      currX += dx;
      currY += dy;
      let className = attr.className;
      let font_size = this.fontSizes[this.baseFont];
      className += ' ' + this.baseFont;
      const coockedmathExpr: CookedMathExpr = {
        expr: expr,
        attr: {
          x: currX,
          y: currY,
          className: className,
        },
      };

      this.cookedMathExprList.push(coockedmathExpr);

      // console.log(coockedmathExpr.expr, this.baseFont);
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

  _handleNonAtoms(pattern: SscriptPattern) {
    const shouldCalList = this._shouldMeasureHeight(pattern);
    let parallel = pattern.isParallel();
    let paralleX = [];
    let idx = 0;
    for (const mathExpr of pattern.mathExpressions) {
      const { currX, currY } = this.currPos;
      // const parserFontFactor = this.fontFactor ===
      const parser = parserFactory({
        str: mathExpr.expr,
        x: currX + mathExpr.attr.dx,
        y: currY + mathExpr.attr.dy,
        baseFont: mathExpr.attr.fontKey,
        pfontSizes: this.fontSizes,
      });

      if (shouldCalList[idx]) {
        const heightChange = this._maxHeightChange(
          parser.cookedMathExprList,
          currY,
          shouldCalList[idx] === 'DOWN' ? 'DOWN' : 'UP'
        );

        // console.log(parser.cookedMathExprList, heightChange, mathExpr.attr.dy);

        const createGroup: CookedMathExpr = {
          expr: 'CREATE_GROUP',
          attr: {
            transform: `translate(0 ${heightChange})`,
            className: 'vshift',
          },
        };
        this.cookedMathExprList.push(createGroup);
      }
      this._pushCookedMathExprList(parser.cookedMathExprList, mathExpr);
      if (shouldCalList[idx]) {
        const closeGroup: CookedMathExpr = {
          expr: 'CLOSE_GROUP',
          attr: {},
        };
        this.cookedMathExprList.push(closeGroup);
      }
      if ((idx === 0 && parallel) || !parallel) {
        // if idx=0 it's base we have to update the currPos
        this.currPos.currX = parser.currPos.currX;
      } else {
        paralleX.push(parser.currPos.currX);
      }
      // this.currPos.currX = parser.currPos.currX;
      idx++;
    }
    if (parallel) {
      // compare 2nd and last mathexprs and update currPos accordingly
      this.currPos.currX =
        paralleX[0] >= paralleX[1] ? paralleX[0] : paralleX[1];
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
        baseFont: mathExpr.attr.fontKey,
        pfontSizes: this.fontSizes,
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
      if (
        cookedMathExpr.expr !== 'CLOSE_GROUP' &&
        cookedMathExpr.expr !== 'CREATE_GROUP'
      ) {
        const mathexprClNames = cookedMathExpr.attr.className;
        const patternClName = patternExpr.attr.className;
        // console.log(cookedMathExpr.expr);
        // console.log('mathexpr :', mathexprClNames);
        // console.log('pattern  :', patternClName);

        const newClNames = this._updateClassName(
          mathexprClNames,
          patternClName
        );
        // console.log('newclName:', newClNames);
        // console.log('-------------------');
        cookedMathExpr.attr.className = newClNames;
      }

      this.cookedMathExprList.push(cookedMathExpr);
    }
  }
  _shouldMeasureHeight(pattern: SscriptPattern) {
    let shouldCal: [false | 'UP' | 'DOWN'] = [false];
    for (let idx = 1; idx < pattern.mathExpressions.length; idx++) {
      const indexExpr = pattern.mathExpressions[idx];
      const indexClName = indexExpr.attr.className;
      const indexType = this._isExprInStr('sub', indexClName) ? 'sub' : 'sup';
      if (indexType === 'sub' && this._isGrowingUP(indexExpr.expr)) {
        shouldCal.push('UP');
      } else if (indexType === 'sup' && this._isGrowingDOWN(indexExpr.expr))
        shouldCal.push('DOWN');
      else shouldCal.push(false);
    }
    return shouldCal;
    // return [false, false, false];
  }
  _measureHeight(matExprList: CookedMathExpr[]) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.classList.add('math_css');
    // svg.style.visibility = 'hidden';
    for (const mathExpr of matExprList) {
      const text = this._createSVGText(mathExpr.expr, mathExpr.attr);
      group.appendChild(text);
    }
    group.setAttribute('transform', 'translate(0 100)');
    svg.appendChild(group);
    document.body.appendChild(svg);
    const height = group.getBBox().height;
    // svg.remove();

    return height;
  }
  _createSVGText(textContent: string, attrs: CookedMathExpr['attr']) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.textContent = textContent;
    for (const key in attrs) {
      if (key === 'className') {
        const clNames = attrs[key].split(' ');
        for (const clname of clNames) {
          text.classList.add(clname);
        }
      } else text.setAttribute(key, attrs[key]);
    }
    return text;
  }
  _maxHeightChange(
    parserRes: CookedMathExpr[],
    currY: number,
    type: 'UP' | 'DOWN'
  ) {
    let maxVerChange = 0;
    let baseline = parserRes[0].attr.y;
    if (type === 'DOWN') {
      for (const mathExpr of parserRes) {
        if (mathExpr.attr.y - baseline > maxVerChange) {
          maxVerChange = mathExpr.attr.y - baseline;
        }
      }

      return (-2 * maxVerChange) / 3;
    } else if (type === 'UP') {
      for (const mathExpr of parserRes) {
        if (baseline - mathExpr.attr.y > maxVerChange) {
          maxVerChange = baseline - mathExpr.attr.y;
        }
      }
      // console.log('UP', maxVerChange);
      // console.log('base', baseline);
      // console.log('currY', currY);
      // return 0;
      // TODO: pron to bug!
      return maxVerChange - baseline / 2;
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
    return function () {
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

    // first we switch btw. math_letter & math_number
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

      // then switch btw. subsup && base
    }
    if (this._isExprInStr('sub', newClassName)) {
      updatedClassNames = this._replaceStr(currClassNames, 'sup', 'sub');
    } else if (this._isExprInStr('sup', newClassName)) {
      updatedClassNames = this._replaceStr(currClassNames, 'sub', 'sup');
    } else {
      updatedClassNames = currClassNames + ' ' + newClassName;
    }
    // then switch the fontsize or add it if it's not exist!
    // const fontsizeKeys = Object.keys(this.fontSizes);

    // for (const fontsize of fontsizeKeys) {
    //   if (this._isExprInStr(fontsize, currClassNames)) {
    //     updatedClassNames = this._replaceStr(currClassNames, fontsize, fontkey);
    //     break;
    //   }
    // }
    // if (!this._isExprInStr(fontkey, currClassNames))
    //   updatedClassNames = currClassNames + ' ' + fontkey;

    return updatedClassNames;
  }
  _isGrowingUP(str: string) {
    const regexp = new RegExp('\\^', 'mg');
    return regexp.test(str);
  }
  _isGrowingDOWN(str: string) {
    const regexp = new RegExp('_', 'mg');
    return regexp.test(str);
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
  pfontSizes,
}: Omit<ParserArgs, 'configs'> & {
  pfontSizes: FontSizesType;
}) {
  // const configs = pfontSizes
  //   ? PConfigs.getInstance(pfontSizes)
  //   : PConfigs.getInstance();
  const configs = new PConfigs(pfontSizes);
  const parser = new Parser({ str, x, y, baseFont, configs });
  parser.parse();
  return parser;
}

class PConfigs {
  fontSizes: FontSizesType;
  cssName: any;
  allPatterns;
  atomPatterns;
  // public static instance: PConfigs;

  constructor(fontSizes: FontSizesType) {
    this.fontSizes = fontSizes;
    this.allPatterns = [patternFactory('sScript', fontSizes)];
    this.atomPatterns = [
      patternFactory('math_letter', fontSizes),
      patternFactory('math_number', fontSizes),
    ];
  }
  // public static getInstance(fontSizes?: FontSizesType) {
  //   if (!PConfigs.instance) {
  //     PConfigs.instance = new PConfigs(fontSizes);
  //   }
  //   return PConfigs.instance;
  // }
  // public getFontSizes() {
  //   return this.fontSizes;
  // }
}
