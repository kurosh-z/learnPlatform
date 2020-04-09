import { FontSizesType } from './MathCss';
const LETTERS = 'a-zA-Z@αβγΓδΔϵζηθΘιIκλΛμνοπΠρσΣτυϕΦχΞξψΨω';
const SUP_DY = -8;
const SUB_DY = 5;

export type IndexType = 'subscript' | 'supscript';
export type MathExpr = {
  expr: string;
  attr?: {
    dx?: number;
    dy?: number;
    className: string;
    fontKey?: keyof FontSizesType;
  };
};

export type PatternArgs = {
  name: string;
  fontSizes?: FontSizesType;
};
export abstract class Pattern {
  abstract regString: string;
  name: PatternArgs['name'];
  fontSizes?: PatternArgs['fontSizes'];
  private _fontKey?: keyof FontSizesType;
  mathExpressions?: MathExpr[];

  // abstract props: Object;
  abstract stratingIndex: number;
  abstract endingIndex: number;
  constructor({ name, fontSizes }: PatternArgs) {
    this.name = name;
    if (fontSizes) {
      this.fontSizes = fontSizes;
    }
  }
  abstract isPattern(expr: string): boolean;
  abstract strToMathExpr(str: string, startIdx?: number): void;
  abstract isParallel(): boolean;

  set fontKey(fontKey: keyof FontSizesType) {
    this._fontKey = fontKey;
  }
  get fontKey() {
    return this._fontKey;
  }
  findmatchingPairs({
    openregStr,
    closeregStr,
    str,
    startIdx = 0,
  }: {
    openregStr: string;
    closeregStr: string;
    str: string;
    startIdx?: number;
  }) {
    const CL_LENGTH = closeregStr.length;
    const regOpen = new RegExp(openregStr, 'mg');
    const regClose = new RegExp(closeregStr, 'mg');
    regOpen.lastIndex = startIdx;
    regClose.lastIndex = startIdx;
    // const str = 'table football, foosball';

    let opMatch: RegExpExecArray, clMatch: RegExpExecArray;
    let numOpen = 0;
    let numClose = 0;
    let idx = 0;
    let flag = true;
    while (flag) {
      opMatch = regOpen.exec(str);
      if (numOpen - numClose === 0 && idx !== 0) {
        // if open & close are balanced look if thre is open beore close => (_{d_{l}})
        if (opMatch) {
          const openIdx = opMatch.index;
          const closeIdx = clMatch.index;
          // console.log('openIdx,closeIdx', openIdx, closeIdx);
          if (openIdx > closeIdx) {
            // look if the next open is outside of the balancing pairs ==> a_{b}^{c}
            flag = false;
            return clMatch.index + CL_LENGTH;
          } else numOpen++; // if open is inside increase the numOpen
        } else return clMatch.index + CL_LENGTH; // if there is no open it should be a simple case a_{b}
      } else if (opMatch) numOpen++; // if still no balance do normally

      clMatch = regClose.exec(str);
      if (clMatch) numClose++;

      if (!opMatch || !clMatch) {
        flag = false;
        throw new Error(`unbalanced pairs in string: ${str}`);
      }

      idx++;
      if (idx > str.length) {
        console.log(`founding pairs reached the maximum number of iteration!`);
        flag = false;
      }
    }
  }
}

export class ScriptPattern extends Pattern {
  // props: Object;
  regString = `([${LETTERS}0-9])((_{)|(\\^{))|([${LETTERS}0-9])((_)|(\\^))([${LETTERS}0-9])`;
  mathExpressions: Required<MathExpr>[];
  stratingIndex: number;
  endingIndex: number;
  isType2: boolean = false;

  constructor({ name, fontSizes }: PatternArgs) {
    super({ name, fontSizes });
  }
  /* 
  test the given str for pattern
  */
  public isPattern(str: string) {
    const regexp = new RegExp(this.regString, 'mg');
    return regexp.test(str);
  }
  isParallel() {
    return this.isType2;
  }

  _findFirstIndex(str: string) {
    const regexp = new RegExp(this.regString, 'mg');
    const match = regexp.exec(str);

    // check if its []_[] or []_{[]} ?
    var type: IndexType;
    var endIdx: number;
    var indexStr: string;

    if (str[2] !== '{') {
      indexStr = str[2];
      endIdx = 3;
    } else {
      endIdx = this.findmatchingPairs({
        openregStr: '{',
        closeregStr: '}',
        str: str,
        startIdx: 0,
      });
      indexStr = str.slice(3, endIdx - 1);
    }
    type = str[1] === '_' ? (type = 'subscript') : 'supscript';

    return { indexStr, type, endIdx };
  }
  _findSecondIndex(str: string, startIdx: number) {
    const regexp = /(_{)|(\^{)|(_)|(\^)/gm;
    regexp.lastIndex = startIdx;
    const match = regexp.exec(str);

    // check if its []_[] or []_{[]} ?
    var type: IndexType;
    var endIdx: number;
    var indexStr: string;

    if (match[0] === '_' || match[0] === '^') {
      indexStr = str[startIdx + 2];
      endIdx = startIdx + 3;
    } else if (match[0] === '_{' || match[0] === '^{') {
      endIdx = this.findmatchingPairs({
        openregStr: '{',
        closeregStr: '}',
        str: str,
        startIdx: match.index + 1,
      });
      indexStr = str.slice(startIdx + 3, endIdx - 1);
    }
    if (match[0] === '_' || match[0] === '_{') type = 'subscript';
    else if (match[0] === '^' || match[0] === '^{') type = 'supscript';

    return { indexStr, type, endIdx };
  }
  strToMathExpr(str: string, startIdx: number = 0) {
    const base = str.slice(startIdx, startIdx + 1);

    let type1: IndexType, type2: IndexType;
    let endIdx1: number, endIdx2: number;
    let indexStr1: string, indexStr2: string;
    let nextIndex = this._findFirstIndex(str);
    type1 = nextIndex.type;
    endIdx1 = nextIndex.endIdx;
    indexStr1 = nextIndex.indexStr;

    //check if thre is another index
    if (str[endIdx1] === '_' || str[endIdx1] === '^') {
      let nextIndex = this._findSecondIndex(str, endIdx1 - 1);
      type2 = nextIndex.type;
      endIdx2 = nextIndex.endIdx;
      indexStr2 = nextIndex.indexStr;
    }

    if (
      (type1 === 'subscript' && type2 === 'subscript') ||
      (type1 === 'supscript' && type2 === 'supscript')
    )
      throw new Error(`double subscript at index ${endIdx1}`);

    if (type2) this.isType2 = true;
    else this.isType2 = false;

    let indexFontKey: keyof FontSizesType;
    if (this.fontKey === 'scriptsize') indexFontKey = 'tiny';
    else if (this.fontKey === 'tiny') indexFontKey = 'tiny';
    else indexFontKey = 'scriptsize';
    let sub_dy = this.fontSizes[indexFontKey] * SUB_DY;
    let sup_dy = this.fontSizes[indexFontKey] * SUP_DY;

    const mathExpressions: Required<MathExpr>[] = type2
      ? [
          {
            expr: base,
            attr: {
              dx: 0,
              dy: 0,
              className: 'base',
              fontKey: this.fontKey,
            },
          },

          {
            expr: indexStr1,
            attr: {
              dx: 0,
              dy: type1 === 'subscript' ? sub_dy : sup_dy,
              className: type1 === 'subscript' ? 'sub' : 'sup',
              fontKey: indexFontKey,
            },
          },
          {
            expr: indexStr2,
            attr: {
              dx: 0,
              dy: type2 === 'subscript' ? sub_dy : sup_dy,
              className: type2 === 'subscript' ? 'sub' : 'sup',
              fontKey: indexFontKey,
            },
          },
        ]
      : [
          {
            expr: base,
            attr: {
              dx: 0,
              dy: 0,
              className: 'base',
              fontKey: this.fontKey,
            },
          },
          {
            expr: indexStr1,
            attr: {
              dx: 0,
              dy: type1 === 'subscript' ? sub_dy : sup_dy,
              className: type1 === 'subscript' ? 'sub' : 'sup',
              fontKey: indexFontKey,
            },
          },
        ];
    this.mathExpressions = mathExpressions;
    this.stratingIndex = startIdx;
    this.endingIndex = type2 ? endIdx2 : endIdx1;
  }
}

export class AtomPattern extends Pattern {
  mathExpressions: MathExpr[];
  stratingIndex: number;
  endingIndex: number;
  numRegStr = '([-+]?)(\\d+.?\\d*)';
  lettRegStr = `[${LETTERS}]+`;
  regString = `[${LETTERS}]+|([-+]?)(\\d+.?\\d*)`;
  constructor({ name }: PatternArgs) {
    super({ name });
  }
  isParallel() {
    return false;
  }
  isPattern(str: string) {
    //for the point char(.) between numbers.
    if (str === '.') return true;
    const regex = new RegExp(this.regString, 'mg');
    return regex.test(str);
  }

  isNumber(str: string) {
    if (str === '.') return true;
    const regex = new RegExp(this.numRegStr, 'gm');
    return regex.test(str);
  }
  isLetter(str: string) {
    if (str === '.') return true;
    const regex = new RegExp(this.lettRegStr, 'gm');
    return regex.test(str);
  }
  isForbidenChar(char: string) {
    if (char === '_' || char === '^') return true;
    return false;
  }
  findRangeGroup(expr: string) {
    let idx = -1;
    let groups: { expr: string; type: 'math_number' | 'math_letter' }[] = [];
    let currGroup: { expr: string; type: 'math_number' | 'math_letter' } = {
      expr: '',
      type: 'math_letter',
    };

    for (const char of expr) {
      if (this.isPattern(char) && !this.isForbidenChar(expr[idx + 2])) {
        idx++;
      } else {
        break;
      }
      if (idx === 0) {
        currGroup.type = this.isLetter(char) ? 'math_letter' : 'math_number';
        currGroup.expr += char;
      } else {
        if (
          (this.isLetter(char) && currGroup.type === 'math_letter') ||
          (this.isNumber(char) && currGroup.type === 'math_number')
        ) {
          currGroup.expr += char;
        } else {
          groups.push(currGroup);
          currGroup = { expr: '', type: 'math_letter' };
          currGroup.type = this.isLetter(char) ? 'math_letter' : 'math_number';
          currGroup.expr += char;
        }
      }
    }
    groups.push(currGroup);
    return { groups: groups, endingIndex: idx + 1 };
  }
  strToMathExpr(str: string, startIdx: number = 0) {
    const { endingIndex, groups } = this.findRangeGroup(str);
    this.stratingIndex = startIdx;
    this.endingIndex = endingIndex;

    const mathExpressions: MathExpr[] = [];
    for (const group of groups) {
      const attr: MathExpr['attr'] = {
        className: group.type,
      };
      mathExpressions.push({ expr: group.expr, attr });
    }

    this.mathExpressions = mathExpressions;
  }
}

const DELIMITERS = {
  matrix: { open: '', close: '' },
  pmatrix: { open: 'parentheses_open', close: 'parentheses_close' },
  bmatrix: { open: 'bracket_open', close: 'bracket_close' },
  Bmatrix: { open: '{', close: '}' },
  vmatrix: { open: 'vertical_bar', close: 'vertical_bar' },
};
type Delimiters = typeof DELIMITERS;
type MatrixType = keyof Delimiters;
type Delimiter = { open: string; close: string };
export class MatrixPattern extends Pattern {
  regString =
    '(\\\\begin)(({matrix})|({pmatrix})|({bmatrix})|({Bmatrix})|({vmatrix})|({Vmatrix}))';
  matrixElements: MathExpr[][];
  stratingIndex: number;
  endingIndex: number;
  mtype: MatrixType;
  delimiter: Delimiter;

  constructor({ name }: PatternArgs) {
    super({ name });
  }
  isParallel() {
    return false;
  }
  isPattern(str: string) {
    const regexp = new RegExp(this.regString, 'mg');
    return regexp.test(str);
  }

  strToMathExpr(str: string, startIdx: number = 0) {
    // const closingStrs =  '(\\\\end)(({matrix})|({pmatrix})|({Bmatrix})|({vmatrix})|({Vmatrix}))';
    const regexp = new RegExp(this.regString, 'gm');
    const match = regexp.exec(str);
    const matrixType = match[2]; // second group should be one of  {matrix} or {pmatrix} ...
    const mtype = matrixType.slice(1, matrixType.length - 1);
    if (!DELIMITERS[mtype])
      throw new Error(`matrix type: ${mtype} is not recognized!`);
    this.mtype = mtype as MatrixType;
    this.delimiter = DELIMITERS[mtype];

    const openregStr = '\\' + match[0]; // \begin{matrix}
    const closeregStr = '\\\\end{' + matrixType.slice(1, matrixType.length);
    let endingIndex = this.findmatchingPairs({
      openregStr,
      closeregStr,
      str,
    });

    const startingIndex = regexp.lastIndex;
    this.stratingIndex = startingIndex;
    // thre is one char more in closeregStr (because of scaping backslash);
    this.endingIndex = endingIndex - 1;
    // console.log(startIdx, endingIndex);
    let matrixElements: MathExpr[][] = [];

    let matrixStr = str.slice(startingIndex, endingIndex - closeregStr.length);
    // matrixStr = this.consumeWhiteSpaces(matrixStr);

    let idx = 0;
    while (matrixStr.length !== 0) {
      const { rowExprs, reducedStr } = this.findNextRow(matrixStr);
      matrixElements.push(rowExprs);
      matrixStr = reducedStr;
      idx++;
      if (idx > str.length) throw new Error('Oops! something went wrong!');
    }
    this.matrixElements = matrixElements;
  }
  // consumeWhiteSpaces(str: string): string {
  //   const newStr = str.replace(/\s+|\t+/gm, '');
  //   return newStr;
  // }

  findNextRow(str: string): { rowExprs: MathExpr[]; reducedStr: string } {
    const regex = /&/gm;
    const endRowRegex = /\\/gm;
    const endRow = endRowRegex.exec(str);
    const endRowIdx = endRow ? endRow.index : str.length; // the last row can be without \\
    let rowExprs: MathExpr[] = [];
    let lastElIdx = 0;
    let idx = 0;
    let expr: string;
    while (lastElIdx < endRowIdx) {
      let match = regex.exec(str);
      if (match) {
        let matchIdx = match.index;
        if (matchIdx < endRowIdx) {
          expr = str.slice(lastElIdx, matchIdx);
          rowExprs.push({ expr });
          lastElIdx = matchIdx + 1;
        } else {
          expr = str.slice(lastElIdx, endRowIdx);
          rowExprs.push({ expr });
          break;
        }
      } else {
        expr = str.slice(lastElIdx, endRowIdx);
        rowExprs.push({ expr });
        break;
      }

      idx++;
      if (idx > str.length)
        throw new Error('loop inside finNextRow is not stable!');
    }
    // const lastExpr = str.slice(lastElIdx, endRowIdx);
    // rowExprs.push({ expr: lastExpr });
    const reducedStr = this.consume(str, endRowIdx + 2);
    return { rowExprs, reducedStr };
  }
  consume(str: string, stratingIndex: number) {
    const reducedStr = str.slice(stratingIndex, str.length);
    return reducedStr;
  }

  findForbidenExprs(str: string) {
    // TODO: add other forbiden expressions here!
    const forbindenRegExp = new RegExp(this.regString, 'gm');
    return;
  }
}

export function patternFactory(
  patternName: 'atom' | 'supsub' | 'matrix',
  fontSizes?: FontSizesType
) {
  if (patternName === 'atom')
    return new AtomPattern({
      name: patternName,
      fontSizes: fontSizes,
    });

  if (patternName === 'supsub')
    return new ScriptPattern({
      name: 'supsub',
      fontSizes: fontSizes,
    });
  if (patternName === 'matrix')
    return new MatrixPattern({
      name: 'matrix',
    });
  else throw new Error(`pattern name ${patternName} is not recognized!`);
}
