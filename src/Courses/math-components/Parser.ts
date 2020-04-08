import {
  patternFactory,
  MathExpr,
  SscriptPattern,
  AtomPattern,
  MatrixPattern,
} from './Pattern';
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

type RawMatrixRow = {
  elementsCookedExprs: CookedMathExpr[];
  width: number;
  height: number;
}[];

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
  currPos: { currX: number; currY: number };
  _maxPosi: { x: number; y: number };
  _maxNega: { x: number; y: number };
  _maxWH: { w: number; h: number };

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
    this._maxPosi = { x: 0, y: 0 };
    this._maxNega = { x: 0, y: 0 };
    this._maxWH = { w: 0, h: 0 };
  }
  _updateMaxWH() {
    const { currX, currY } = this.currPos;

    if (currY > 0) {
      if (currY > this._maxPosi.y) this._maxPosi.y = currY;
    } else if (currY < 0) {
      if (currY < this._maxNega.y) this._maxNega.y = currY;
    }
    if (currX > 0) {
      if (currX > this._maxPosi.x) this._maxPosi.x = currX;
    } else if (currX < 0) {
      if (currX < this._maxNega.x) this._maxNega.x = currX;
    }
    this._maxWH.w = this._maxPosi.x - this._maxNega.x;
    this._maxWH.h = this._maxPosi.y - this._maxNega.y;
  }
  _updateMaxWHFromParser(parser: Parser) {
    const parserMaxPosi = parser._maxPosi;
    const parserMaxNega = parser._maxNega;
    if (parserMaxPosi.x > this._maxPosi.x) {
      this._maxPosi.x = parserMaxPosi.x;
    }
    if (parserMaxPosi.y > this._maxPosi.y) {
      this._maxPosi.y = parserMaxPosi.y;
    }
    if (parserMaxNega.x < this._maxNega.x) {
      this._maxNega.x = parserMaxNega.x;
    }
    if (parserMaxNega.y < this._maxNega.y) {
      this._maxNega.y = parserMaxNega.y;
    }
    this._maxWH.w = this._maxPosi.x - this._maxNega.x;
    this._maxWH.h = this._maxPosi.y - this._maxNega.y;
  }
  get maxWH() {
    const _maxWH = this._maxWH;
    return { w: _maxWH.w, h: _maxWH.h + 10 }; // 10 is the avarage height of the charachter! it should be
    //                                           accurate enought for now!
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
  whichPattern(
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
        const pattern = this.whichPattern(match[0], this.patternList);
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
    const pattern = this.whichPattern(match[0], this.atomPatternsList);
    pattern.strToMathExpr(str, match.index);
    const mathexprList = pattern.mathExpressions;
    for (const mathexpr of mathexprList) {
      const { expr, attr } = mathexpr;
      // const { dx, dy } = attr;
      let { currX, currY } = this.currPos;
      // currX += dx;
      // currY += dy;
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
      currX += exprWidth + 0.0;
      // console.log(currX);

      // console.log('atom', expr);
      // console.log('width', exprWidth);
      // console.log('before widht', this.currPos.currX);
      this.currPos = { currX, currY };
      // console.log('after width', this.currPos.currX);
      this._updateMaxWH();

      // console.log('maxW', this._maxWH.w);
      // console.log('maxH', this._maxWH.h);
      // console.log(expr, currX);
      // console.log('-----------------');
    }
    str = this.consume(str, pattern.endingIndex);
    return str;
  }

  _handleNonAtoms(pattern: SscriptPattern | MatrixPattern) {
    if (pattern instanceof MatrixPattern) this._handleMatrix(pattern);
    else {
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
          parentParser: this,
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
  }
  _handleMatrix(pattern: MatrixPattern) {
    const matrixElements = pattern.matrixElements;
    let currX = 0;
    let currY = 0;

    let rawMatrixRow: RawMatrixRow = [];
    let rawMatrixElements: RawMatrixRow[] = [];

    let rowMaxH: number[] = [];
    let columnMaxW: number[] = [];

    let i = 0; //row index
    let j = 0; // column index

    for (const row of matrixElements) {
      for (const elm of row) {
        const expr = elm.expr;
        // console.log('expr', expr);

        const parser = parserFactory({
          str: expr,
          x: currX,
          y: currY,
          baseFont: this.baseFont,
        });

        const elMaxWH = parser.maxWH;
        const elMaxW = elMaxWH.w;
        const elMaxH = elMaxWH.h;
        // console.log('ij:   ', i, j, expr);
        // console.log('maxW', elMaxW);
        // console.log('maxH', elMaxH);

        rawMatrixRow.push({
          elementsCookedExprs: parser.cookedMathExprList,
          width: elMaxW,
          height: elMaxH,
        });

        if (j === 0) {
          rowMaxH.push(elMaxH);
        } else {
          if (rowMaxH[i] < elMaxH) rowMaxH[i] = elMaxH;
        }

        if (i === 0) {
          columnMaxW.push(elMaxW);
        } else {
          if (columnMaxW[j] < elMaxW) columnMaxW[j] = elMaxW;
        }

        j++;
      }
      j = 0;
      i++;
      rawMatrixElements.push(rawMatrixRow);

      // console.log('rawMatrixRow', rawMatrixRow);
      rawMatrixRow = [];
      // console.log('-------------------------------');
    }
    // console.log(rowMaxH, columnMaxW);
    // console.log(rawMatrixElements);
    const FONT_FACTOR = this.fontSizes[this.baseFont];
    const TOP = 5 * FONT_FACTOR;
    const BOTTOM = 5 * FONT_FACTOR;
    const LEFT = 8 * FONT_FACTOR;
    const RIGHT = 8 * FONT_FACTOR;
    i = 0;
    j = 0;
    const currX0 = this.currPos.currX;
    const currY0 = this.currPos.currY;
    for (const rawMatrixRow of rawMatrixElements) {
      for (const elem of rawMatrixRow) {
        const elementsCookedExprs = elem.elementsCookedExprs;
        const { currX, currY } = this.currPos;
        const posX = (columnMaxW[j] - elem.width) / 2 + currX;
        // const posY = (rowMaxH[i] - elem.height) / 2 + currY;
        const posY = currY;
        // open a group and shift the group by (posX,poxY)
        const createGroup: CookedMathExpr = {
          expr: 'CREATE_GROUP',
          attr: {
            transform: `translate(${posX} ${posY})`,
            className: `mat_${i}_${j}`,
          },
        };
        this.cookedMathExprList.push(createGroup);
        this._pushCookedMatrixElements({ elementsCookedExprs });
        const closeGroup: CookedMathExpr = {
          expr: 'CLOSE_GROUP',
          attr: {},
        };
        this.cookedMathExprList.push(closeGroup);
        this.currPos.currX += LEFT + columnMaxW[j] + RIGHT;
        j++;
      }
      this.currPos.currX = currX0;
      this.currPos.currY = currY0 + (rowMaxH[i] + TOP + BOTTOM);

      j = 0;
      i++;
    }
  }

  _pushCookedMatrixElements({
    elementsCookedExprs,
  }: {
    elementsCookedExprs: CookedMathExpr[];
  }) {
    for (const mathExpr of elementsCookedExprs) {
      this.cookedMathExprList.push(mathExpr);
    }
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
  _isGrowingUP(str: string) {
    const regexp = new RegExp('\\^', 'mg');
    return regexp.test(str);
  }
  _isGrowingDOWN(str: string) {
    const regexp = new RegExp('_', 'mg');
    return regexp.test(str);
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
  parentParser,
}: Omit<ParserArgs, 'configs'> & {
  pfontSizes?: FontSizesType;
  parentParser?: Parser;
}) {
  const configs = pfontSizes
    ? PConfigs.getInstance(pfontSizes)
    : PConfigs.getInstance();
  // const configs = new PConfigs(pfontSizes);
  const parser = new Parser({ str, x, y, baseFont, configs });
  parser.parse();
  // if parentParse update maxWH of the parent!
  if (parentParser) {
    parentParser._updateMaxWHFromParser(parser);
  }
  return parser;
}

class PConfigs {
  fontSizes: FontSizesType;
  cssName: any;
  allPatterns: [SscriptPattern, MatrixPattern];
  atomPatterns: AtomPattern[];
  public static instance: PConfigs;

  private constructor(fontSizes: FontSizesType) {
    this.fontSizes = fontSizes;
    this.allPatterns = [
      // @ts-ignore
      patternFactory('sScript', fontSizes),
      // @ts-ignore
      patternFactory('matrix'),
    ];
    this.atomPatterns = [
      // @ts-ignore
      patternFactory('atom', fontSizes),
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
