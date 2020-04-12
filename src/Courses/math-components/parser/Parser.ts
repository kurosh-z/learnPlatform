import AtomPattern from './AtomPattern';
import AtomSpecPattern from './AtomSpecPattern';
import SymbolPattern from './SymbolPattern';
import { FontSizesType } from './mathCss';
import { getStringMetrics, FONT_FAMILIES, FONT_STYLES } from './fontMetrics';
import MatrixPattern from './MatrixPattern';
import { MathExpr, CurrBase } from './Pattern';
import ScriptPattern from './ScriptPattern';
import PConfigs from './Pconfigs';
import parserFactory from './parserFactory';
// import './test.css';

export type CookedMathExpr = {
  expr: string;
  attr: { x?: number; y?: number; className?: string; transform?: string };
};

type Ptext = {
  component: 'text';
  attr: { x: number; y: number; className: string };
  mathExpr: string;
};
type Pdelimiter = {
  component: 'delimiter';
  dtype:
    | 'bracket_open'
    | 'bracket_close'
    | 'parentheses_open'
    | 'parentheses_close'
    | 'vertical_bar'
    | 'check_line';
  dattr: {
    transform: string;
    height?: number;
    width?: number;
    text?: string;
  };
};
type PGroup = {
  component: 'group';
  gattr: { className?: string; transform?: string };
  gelements: ParserOutputList;
};
type ParserOut = {
  Ptext: Ptext;
  Pdelimiter: Pdelimiter;
  PGroup: PGroup;
};

export type ParserOutput<T extends keyof ParserOut> = ParserOut[T];

export type ParserOutputList = (
  | ParserOutput<'Ptext'>
  | ParserOutput<'Pdelimiter'>
  | ParserOutput<'PGroup'>
)[];

export type ParserArgs = {
  str: string;
  x?: number;
  y?: number;
  fontKey?: keyof FontSizesType;
  configs: PConfigs;
};
export default class Parser {
  outputs: ParserOutputList = [];
  str: string;
  currStr: string;
  fontKey: keyof FontSizesType;
  classNames: string = '';
  configs: PConfigs;
  fontSizes: FontSizesType;
  patternList: PConfigs['allPatterns'];
  atomPatternsList: PConfigs['atomPatterns'];
  allRegStrings: string;
  allAtomRegStrings: string;
  currPos: { currX: number; currY: number };
  BBox: { top: number; bottom: number; left: number; right: number } = {
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  };
  maxWH: { w: number; h: number };
  currBase: CurrBase = 'atom';

  constructor({
    str,
    x = 0,
    y = 0,
    configs,
    fontKey = 'normalsize',
  }: ParserArgs) {
    this.str = str;
    this.configs = configs;
    this.fontSizes = this.configs.fontSizes;
    this.patternList = this.configs.allPatterns;
    this.atomPatternsList = this.configs.atomPatterns;
    this.fontKey = fontKey;
    this.currPos = { currX: x, currY: y };
    this.allRegStrings = this._makeAllregStrings(this.patternList);
    this.allAtomRegStrings = this._makeAllregStrings(this.atomPatternsList);
    this.maxWH = { w: 0, h: 0 };
    this.BBox = { left: x, right: x, top: y, bottom: y };
  }

  _updateBBox(strAscent: number, strDescent: number) {
    const { currX, currY } = this.currPos;
    const { top, bottom, left, right } = this.BBox;
    const currAsc = currY - strAscent;
    const currDsc = currY + strDescent;

    if (currAsc < top) {
      this.BBox.top = currAsc;
    }
    if (currDsc > bottom) {
      this.BBox.bottom = currDsc;
    }
    if (currX < left) {
      this.BBox.left = currX;
    }
    if (currX > right) {
      this.BBox.right = currX;
    }
    this.maxWH.w = this.BBox.right - this.BBox.left;
    this.maxWH.h = this.BBox.bottom - this.BBox.top;
  }

  _updateMaxWHFromParser(parser: Parser) {
    const { left, right, top, bottom } = this.BBox;

    const parserLeft = parser.BBox.left;
    const parserRight = parser.BBox.right;
    const parserTop = parser.BBox.top;
    const parserBottom = parser.BBox.bottom;

    if (parserLeft < left) {
      this.BBox.left = parserLeft;
    }
    if (parserRight > right) {
      this.BBox.right = parserRight;
    }
    if (parserTop < top) {
      this.BBox.top = parserTop;
    }
    if (parserBottom > bottom) {
      this.BBox.bottom = parserBottom;
    }

    this.maxWH.w = this.BBox.right - this.BBox.left;
    this.maxWH.h = this.BBox.bottom - this.BBox.top;
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
  // consume(expr: string, startingIndex: number) {
  //   // console.log('consume', startingIndex, expr);
  //   const reducedExpr = expr.slice(startingIndex, expr.length);
  //   return reducedExpr;
  // }
  _consumeWhiteSpaces(str: string): string {
    const newStr = str.replace(/\s+|\t+/gm, '');
    return newStr;
  }

  strToMathExpressions(str: string) {
    let nstr = this._consumeWhiteSpaces(str);
    // nstr = nstr.replace(/(\\int)/gm, '∫');
    let idx = 0;

    while (nstr.length !== 0) {
      const regexAll = new RegExp(this.allRegStrings, 'mg');
      const match = regexAll.exec(nstr);
      // console.log(match);
      if (!match || match.index !== 0) {
        nstr = this._handleAtoms(nstr);
        // console.log('parserStr', this.str);
        // console.log('str: ', str);
        // console.log('nstr', nstr);
        // console.log('------------------------');
      } else {
        const pattern = this.whichPattern(match[0], this.patternList);
        pattern.fontKey = this.fontKey;
        pattern.currBase = this.currBase;
        pattern.currBBox = this.BBox;
        pattern.strToMathExpr(nstr, match.index);
        this.currBase = 'atom';
        // nstr = this.consume(nstr, pattern.endingIndex);
        nstr = pattern.stringsRest;

        // console.log('parserStr', this.str);
        // console.log('str: ', str);
        // console.log('nstr', nstr);
        // console.log('------------------------');
        this._handleNonAtoms(
          pattern as MatrixPattern | ScriptPattern | SymbolPattern
        );
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
    // pattern's fontkey is defaulted to normalsize and is just required by SepecialCharPattern
    // but we're set them anyway!
    pattern.fontKey = this.fontKey;
    pattern.strToMathExpr(str, match.index);
    const mathexprList = pattern.mathExpressions;
    for (const mathexpr of mathexprList) {
      const { expr, attr } = mathexpr;
      const { dx, dy, dxx, dyy } = attr;
      let { currX, currY } = this.currPos;

      if (dx) {
        currX += dx;
      }
      if (dy) {
        currY += dy;
      }
      let className = attr.className;
      className += ' ' + this.fontKey;

      let font_size = this.fontSizes[this.fontKey];
      let fontFamily: FONT_FAMILIES = 'KaTeX_Math';
      let fontStyle: FONT_STYLES = 'italic';
      if (pattern instanceof AtomPattern && pattern.isNumber(expr)) {
        font_size = 0.9 * font_size;
        fontFamily = 'KaTex_Main';
        fontStyle = 'normal';
      }
      if (pattern instanceof AtomSpecPattern) {
        fontFamily = mathexpr.attr.fontFamily;
        fontStyle = mathexpr.attr.fontStyle;
      }

      const output: ParserOutput<'Ptext'> = {
        component: 'text',
        mathExpr: expr,
        attr: { x: currX, y: currY, className: className },
      };

      // console.log(coockedmathExpr.expr, this.fontKey);

      // font font_size font_style
      // console.log(this.fontKey, this.fontSizes[this.fontKey], font_size);
      const { width, maxAscent, maxDescent } = getStringMetrics({
        str: expr,
        fontFamily,
        fontSize: font_size,
        fontStyle,
      });

      this.outputs.push(output);

      // console.log(
      //   expr,
      //   'width',
      //   width,
      //   'maxAscent',
      //   maxAscent,
      //   'maxDescent',
      //   maxDescent
      // );
      // console.log('------------');
      currX += width;
      // after charachter positionings
      if (dxx) {
        currX += dxx;
      }
      if (dyy) {
        currX += dyy;
      }

      this.currPos = { currX, currY };
      this._updateBBox(maxAscent, maxDescent);

      // console.log('after width', this.currPos.currX);

      // console.log(expr, currX);
      // console.log('maxW', this._maxWH.w);
      // console.log('maxH', this._maxWH.h, this.maxWH);
      // console.log('-----------------');
    }

    // str = this.consume(str, pattern.endingIndex);
    str = pattern.stringsRest;
    return str;
  }

  _handleNonAtoms(pattern: ScriptPattern | MatrixPattern | SymbolPattern) {
    this.currBase = pattern.changeCurrBaseTo();
    if (pattern instanceof MatrixPattern) {
      this.currBase = 'mat';
      this._handleMatrix(pattern);
    } else {
      // const shouldCalList = this._shouldMeasureHeight(pattern);
      let parallel = pattern.isParallel();
      let paralleX = [];

      for (const mathExpr of pattern.mathExpressions) {
        const { currX, currY } = this.currPos;
        // const parserFontFactor = this.fontFactor ===
        const parser = parserFactory({
          str: mathExpr.expr,
          x: currX + mathExpr.attr.dx,
          y: currY + mathExpr.attr.dy,
          fontKey: mathExpr.attr.fontKey,
          parentParser: this,
        });
        this._pushParserOutputs({ parser: parser, patternExpr: mathExpr });

        if (!parallel) {
          // if idx=0 it's base we have to update the currPos
          this.currPos.currX = parser.currPos.currX;
        } else {
          paralleX.push(parser.currPos.currX);
        }
        // this.currPos.currX = parser.currPos.currX;
      }
      if (parallel) {
        // compare 2nd and last mathexprs and update currPos accordingly
        this.currPos.currX =
          paralleX[0] >= paralleX[1] ? paralleX[0] : paralleX[1];
      }
    }
  }

  _pushParserOutputs({
    parser,
    patternExpr,
  }: {
    parser: Parser;
    patternExpr: MathExpr;
  }) {
    for (const output of parser.outputs) {
      if (output.component === 'text') {
        const parserClNames = output.attr.className;
        const patternClName = patternExpr.attr.className;
        // console.log(cookedMathExpr.expr);
        // console.log('mathexpr :', mathexprClNames);
        // console.log('pattern  :', patternClName);

        const newClNames = this._updateClassName(parserClNames, patternClName);
        // console.log('newclName:', newClNames);
        // console.log('-------------------');
        output.attr.className = newClNames;
      }

      this.outputs.push(output);
    }
  }

  _handleMatrix(pattern: MatrixPattern) {
    const matrixElements = pattern.matrixElements;
    const mDim = [matrixElements.length, matrixElements[0].length];
    const mtype = pattern.mtype;

    // first we find the width and height of each element
    // and also the maximum height and width
    type RawMatrixRow = {
      elements: ParserOutputList;
      elWidth: number;
      elHeight: number;
      elTop: number;
      elBottom: number;
    }[];
    let rawMatrixRow: RawMatrixRow = [];
    let rawMatrixElements: RawMatrixRow[] = [];

    let rowMaxH: number[] = [];
    let columnMaxW: number[] = [];
    let rowMaxTop: number[] = [];
    let rowMaxBottom: number[] = [];

    let i = 0; //row index
    let j = 0; // column index

    for (const row of matrixElements) {
      for (const elm of row) {
        const expr = elm.expr;
        // console.log('expr', expr);

        const parser = parserFactory({
          str: expr,
          x: 0,
          y: 0,
          fontKey: this.fontKey,
        });

        const elMaxWH = parser.maxWH;
        const elBBox = parser.BBox;
        const elMaxW = elMaxWH.w;
        const elMaxH = elMaxWH.h;
        const elTop = elBBox.top;
        const elBottom = elBBox.bottom;
        // console.log('ij:   ', i, j, expr);
        // console.log('maxW', elMaxW);
        // console.log('maxH', elMaxH);

        rawMatrixRow.push({
          elements: parser.outputs,
          elWidth: elMaxW,
          elHeight: elMaxH,
          elTop: elTop,
          elBottom: elBottom,
        });

        if (j === 0) {
          rowMaxH.push(elMaxH);
          rowMaxTop.push(elTop);
          rowMaxBottom.push(elBottom);
        } else {
          if (rowMaxH[i] < elMaxH) rowMaxH[i] = elMaxH;
          if (rowMaxTop[i] > elTop) rowMaxTop[i] = elTop; // elTop is negative
          if (rowMaxBottom[i] < elBottom) rowMaxBottom[i] = elBottom;
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
    // center the matrix vertically based on the current baseline
    const currX0 = this.currPos.currX;
    const currY0 = this.currPos.currY;
    const FONT_FACTOR = this.fontSizes[this.fontKey];
    const V_MARGIN = 18 * FONT_FACTOR;
    const H_MARGIN = 8 * FONT_FACTOR;
    const DH_MARGIN = 2 * FONT_FACTOR; // Delimiter's horizontal margin(top and bottom of matrix)
    const DV_MARGIN = 5 * FONT_FACTOR;
    const BL_ADJ = 5 * FONT_FACTOR; // basline adjustment
    // calculate the height and width of the matrix:
    let mHeight = 0;
    for (const hieght of rowMaxH) {
      mHeight += hieght;
    }
    mHeight += H_MARGIN * (mDim[0] - 1) + 2 * DH_MARGIN;

    const delim_hieght = mHeight;
    let mWidth = 0;
    for (const width of columnMaxW) {
      if (width > mWidth) mWidth = width;
    }
    mWidth += V_MARGIN * (mDim[1] - 1);

    // if matrix is the first comp we need no margin left!
    // const outLen = this.outputs.length;
    const matrixX = currX0 + DV_MARGIN;
    const matrixY = currY0 - mHeight / 2 - BL_ADJ;
    let matrixGroup: PGroup = {
      component: 'group',
      gelements: [],
      gattr: {
        transform: `translate(${matrixX} ${matrixY})`,
        className: `${mtype}`,
      },
    };

    // push opening delimeter
    const delimiter_open: Pdelimiter = {
      component: 'delimiter',
      dtype: 'bracket_open',
      dattr: {
        transform: `translate(${0} ${-matrixY})`,
        height: delim_hieght,
      },
    };

    matrixGroup.gelements.push(delimiter_open);
    // this.outputs.push(delimiter_open);

    //reset i,j
    i = 0;
    j = 0;

    var currX = DV_MARGIN;
    var currY = DH_MARGIN + BL_ADJ; // on top of the matrix!
    var posY: number;
    var posX: number;
    for (const rawMatrixRow of rawMatrixElements) {
      for (const matrixEl of rawMatrixRow) {
        const elements = matrixEl.elements;
        posX = currX + (columnMaxW[j] - matrixEl.elWidth) / 2;
        posY = currY - rowMaxTop[i];
        // open a group and shift the group by (posX,poxY)
        const elementGroup: PGroup = {
          component: 'group',
          gelements: elements,
          gattr: {
            transform: `translate(${posX} ${posY})`,
            className: `mat_${i}_${j}`,
          },
        };
        // push elements to matrix group
        matrixGroup.gelements.push(elementGroup);
        // matrixGroup.gelements.push(this._checkline(posX, posY));
        // update the postion for the next element
        const dx =
          j !== mDim[1] - 1
            ? columnMaxW[j] + V_MARGIN
            : columnMaxW[j] + DV_MARGIN;

        currX += dx;
        // matrixGroup.gelements.push(this._checkline(this.currPos.currX, posY));

        j++;
      }

      // matrixGroup.gelements.push(this._checkline(currX, posY));
      if (i !== mDim[0] - 1) {
        currX = DV_MARGIN;
      }
      currY = posY + rowMaxBottom[i] + H_MARGIN;
      // matrixGroup.gelements.push(this._checkline(0, currY));

      j = 0;
      i++;
    }

    // push closing delimeter
    const delimiter_close: Pdelimiter = {
      component: 'delimiter',
      dtype: 'bracket_close',
      dattr: {
        transform: `translate(${currX} ${-matrixY})`,
        height: delim_hieght,
      },
    };
    matrixGroup.gelements.push(delimiter_close);
    // this.currPos.currX += DH_MARGIN;
    // push matrix group
    this.outputs.push(matrixGroup);

    // update positions:
    this.currPos.currX = matrixX + currX + 1 * DV_MARGIN;
    this.currPos.currY = currY0;
    // this.outputs.push(this._checkline(this.currPos.currX, this.currPos.currY));

    // set BBox
    this.BBox.right = this.currPos.currX;
    this.BBox.top = -mHeight / 2;
    this.BBox.bottom = mHeight / 2;
  }
  _checkline(x: number, y: number, text?: string) {
    const check_line: Pdelimiter = {
      component: 'delimiter',
      dtype: 'check_line',
      dattr: { transform: `translate(${x} ${y})`, text },
    };

    return check_line;
  }

  //TODO: should be changed
  _shouldMeasureHeight(pattern: ScriptPattern) {
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
  //TODO: should be changed
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
  //TODO: don't need this anymore?
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

    return updatedClassNames;
  }

  parse() {
    let str = this.str;
    this.strToMathExpressions(str);
    return this.outputs;
  }
}
