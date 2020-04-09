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

export type Ptext = {
  component: 'text';
  attr: { x: number; y: number; className: string };
  mathExpr: string;
};
export type Pdelimiter = {
  component: 'delimiter';
  dtype:
    | 'bracket_open'
    | 'bracket_close'
    | 'parentheses_open'
    | 'parentheses_close'
    | 'vertical_bar'
    | 'check_line';
  dattr: { transform: string; height?: number; width?: number };
};
export type PGroup = {
  component: 'group';
  gattr: { className?: string; transform?: string };
  gelements: ParserOutputList;
};
type ParserOutput<T extends Ptext | Pdelimiter | PGroup> = {
  [key in keyof T]: T[key];
};

export type ParserOutputList = (
  | ParserOutput<Ptext>
  | ParserOutput<Pdelimiter>
  | ParserOutput<PGroup>
)[];

type RawMatrixRow = {
  elements: ParserOutputList;
  elwidth: number;
  elheight: number;
}[];

type ParserArgs = {
  str: string;
  x?: number;
  y?: number;
  baseFont?: keyof FontSizesType;
  configs: PConfigs;
};
class Parser {
  outputs: ParserOutputList = [];
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
    return { w: _maxWH.w, h: _maxWH.h + 10 * this.fontSizes[this.baseFont] };
    // 10 is the avarage height of the charachter! it should be
    // accurate enought for now!
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
  _consumeWhiteSpaces(str: string): string {
    const newStr = str.replace(/\s+|\t+/gm, '');
    return newStr;
  }

  strToMathExpressions(str: string) {
    let nstr = this._consumeWhiteSpaces(str);
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

      const output: ParserOutput<Ptext> = {
        component: 'text',
        mathExpr: expr,
        attr: { x: currX, y: currY, className: className },
      };
      this.outputs.push(output);

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
      // const shouldCalList = this._shouldMeasureHeight(pattern);
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
        this._pushParserOutputs({ parser: parser, patternExpr: mathExpr });

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
    const delimiter = pattern.delimiter;

    // first we find the width and height of each element
    // and also the maximum height and width
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
          x: 0,
          y: 0,
          baseFont: this.baseFont,
        });

        const elMaxWH = parser.maxWH;
        const elMaxW = elMaxWH.w;
        const elMaxH = elMaxWH.h;
        // console.log('ij:   ', i, j, expr);
        // console.log('maxW', elMaxW);
        // console.log('maxH', elMaxH);

        rawMatrixRow.push({
          elements: parser.outputs,
          elwidth: elMaxW,
          elheight: elMaxH,
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
    // center the matrix vertically based on the current baseline
    const currX0 = this.currPos.currX;
    const currY0 = this.currPos.currY;
    const FONT_FACTOR = this.fontSizes[this.baseFont];
    const V_MARGIN = 8 * FONT_FACTOR;
    const H_MARGIN = 12 * FONT_FACTOR;
    const D_MARGIN = 5 * FONT_FACTOR; // Delimiter's horizontal margin
    const DV_MARGIN = 3 * FONT_FACTOR;
    const ADJ_CONST = 5 * FONT_FACTOR; // vertical adjustment for changing the basline to the center of the text!
    // calculate the height and width of the matrix:
    let mHeight = 0;
    for (const hieght of rowMaxH) {
      mHeight += hieght;
    }
    // TODO: should we meausure row heights more accuretly?
    mHeight += V_MARGIN * (mDim[0] - 3);
    const delim_hieght = mHeight + 2 * V_MARGIN + 2 * DV_MARGIN;
    let mWidth = 0;
    let nColumn = 0;
    for (const width of columnMaxW) {
      if (width > mWidth) mWidth = width;
      nColumn++;
    }
    mWidth = (V_MARGIN + mWidth) * nColumn;

    const matrixX = currX0 + 2 * D_MARGIN;
    const matrixY = currY0 - mHeight / 2 - ADJ_CONST / 2;
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
        transform: `translate(${0} ${-matrixY - ADJ_CONST})`,
        height: delim_hieght,
      },
    };

    matrixGroup.gelements.push(delimiter_open);
    // this.outputs.push(delimiter_open);

    //reset i,j
    i = 0;
    j = 0;
    var currX = D_MARGIN;
    var currY = 0;
    for (const rawMatrixRow of rawMatrixElements) {
      for (const matrixEl of rawMatrixRow) {
        const elements = matrixEl.elements;
        const posX = (columnMaxW[j] - matrixEl.elwidth) / 2 + currX;
        const posY = currY;
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
            ? columnMaxW[j] + H_MARGIN
            : columnMaxW[j] + D_MARGIN;

        currX += dx;
        // matrixGroup.gelements.push(this._checkline(this.currPos.currX, posY));

        j++;
      }

      // matrixGroup.gelements.push(this._checkline(currX, posY));
      if (i !== mDim[0] - 1) {
        currX = D_MARGIN;
      }
      currY += rowMaxH[i] + V_MARGIN;
      // matrixGroup.gelements.push(this._checkline(0, currY));

      j = 0;
      i++;
    }

    // push closing delimeter
    const delimiter_close: Pdelimiter = {
      component: 'delimiter',
      dtype: 'bracket_close',
      dattr: {
        transform: `translate(${currX} ${-matrixY - ADJ_CONST})`,
        height: delim_hieght,
      },
    };
    matrixGroup.gelements.push(delimiter_close);
    this.currPos.currX += D_MARGIN;
    // push matrix group
    this.outputs.push(matrixGroup);

    // update positions:
    this.currPos.currX += currX + 3 * D_MARGIN;
    this.currPos.currY = currY0;
  }
  _checkline(x: number, y: number) {
    const check_line: Pdelimiter = {
      component: 'delimiter',
      dtype: 'check_line',
      dattr: { transform: `translate(${x} ${y})` },
    };

    return check_line;
  }

  //TODO: should be changed
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
    return this.outputs;
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
