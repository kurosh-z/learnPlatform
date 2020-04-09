import { FontSizesType } from './MathCss';
const SUP_DY = -10;
const SUB_DY = 6;

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
  regString: string;
  fontSizes?: FontSizesType;
};
export abstract class Pattern {
  regString: PatternArgs['regString'];
  name: PatternArgs['name'];
  fontSizes?: PatternArgs['fontSizes'];
  private _baseFont?: keyof FontSizesType;
  mathExpressions?: MathExpr[];

  // abstract props: Object;
  abstract stratingIndex: number;
  abstract endingIndex: number;
  constructor({ regString, name, fontSizes }: PatternArgs) {
    this.regString = regString;
    this.name = name;
    if (fontSizes) {
      this.fontSizes = fontSizes;
    }
  }
  abstract isPattern(expr: string): boolean;
  abstract strToMathExpr(str: string, startIdx?: number): void;
  abstract isParallel(): boolean;

  set baseFont(baseFont: keyof FontSizesType) {
    this._baseFont = baseFont;
  }
  get baseFont() {
    return this._baseFont;
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

export class SscriptPattern extends Pattern {
  // props: Object;
  mathExpressions: Required<MathExpr>[];
  stratingIndex: number;
  endingIndex: number;
  isType2: boolean = false;

  constructor({ regString, name, fontSizes }: PatternArgs) {
    super({ regString, name, fontSizes });
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

  strToMathExpr(str: string, startIdx: number = 0) {
    const base = str.slice(startIdx, startIdx + 1);
    // [a-z]_[a-z0-9]

    const regexp = new RegExp(this.regString, 'mg');
    const match = regexp.exec(str);
    if (!match)
      throw new Error(`math expresion dosen't containt ${this.name} pattern!`);

    // check if its []_[] or []_{[]} ?
    let type1: IndexType, type2: IndexType;
    let endIdx1: number, endIdx2: number;
    let indexStr1: string, indexStr2: string;
    if (str[startIdx + 2] !== '{') {
      type1 = str[startIdx + 1] === '_' ? (type1 = 'subscript') : 'supscript';
      indexStr1 = str[startIdx + 2];
      endIdx1 = startIdx + 3;
    } else {
      endIdx1 = this.findmatchingPairs({
        openregStr: '{',
        closeregStr: '}',
        str: str,
        startIdx: startIdx,
      });

      if (str[startIdx + 1] === '_') type1 = 'subscript';
      else if (str[startIdx + 1] === '^') type1 = 'supscript';
      else
        throw new Error(
          `Error at index ${startIdx} expected _{ or ^{ got ${str.slice(
            startIdx + 1,
            startIdx + 3
          )}`
        );

      if (str[endIdx1] === '_') {
        if (type1 === 'subscript')
          throw new Error(`double subscript at index ${endIdx1}`);
        else type2 = 'subscript';
      } else if (str[endIdx1] === '^') {
        if (type1 === 'supscript')
          throw new Error(`double supscript at index ${endIdx1}`);
        else type2 = 'supscript';
      } else type2 = null;

      indexStr1 = str.slice(startIdx + 3, endIdx1 - 1);
      let startIdx2: number;
      let endIdx2: number;
      if (type2) {
        startIdx2 = endIdx1 + 2; //  _{...}^{...}
        endIdx2 = this.findmatchingPairs({
          openregStr: '{',
          closeregStr: '}',
          str: str,
          startIdx: endIdx1,
        });
        indexStr2 = str.slice(startIdx2, endIdx2 - 1);
      }
    }

    if (type2) this.isType2 = true;
    else this.isType2 = false;
    let indexFontKey: keyof FontSizesType;
    if (this.baseFont === 'scriptsize') indexFontKey = 'tiny';
    else if (this.baseFont === 'tiny') indexFontKey = 'tiny';
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
              fontKey: this.baseFont,
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
              fontKey: this.baseFont,
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
  numRegStr: string;
  lettRegStr: string;
  constructor({
    regString,
    name,
    numRegStr,
    lettRegStr,
  }: PatternArgs & { numRegStr: string; lettRegStr: string }) {
    super({ regString, name });
    this.numRegStr = numRegStr;
    this.lettRegStr = lettRegStr;
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
  pmatrix: { open: '(', close: ')' },
  bmatrix: { open: '[', close: ']' },
  Bmatrix: { open: '{', close: '}' },
  vmatrix: { open: '|', close: '|' },
};
type Delimiters = typeof DELIMITERS;
type MatrixType = keyof Delimiters;
type Delimiter = { open: string; close: string };
export class MatrixPattern extends Pattern {
  matrixElements: MathExpr[][];
  stratingIndex: number;
  endingIndex: number;
  mtype: MatrixType;
  delimiter: Delimiter;

  constructor({ name, regString }: PatternArgs) {
    super({ name, regString });
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

const allLetters = 'a-zA-Z@αβγΓδΔϵζηθΘιIκλΛμνοπΠρσΣτυϕΦχΞξψΨω';
const sscript_string = `([${allLetters}0-9])((_{)|(\\^{))|([${allLetters}0-9])((_)|(\\^))([${allLetters}0-9])`;
const atom_letter = `[${allLetters}]+`;
const atom_number = '([-+]?)(\\d+.?\\d*)';
const matrix_sring =
  '(\\\\begin)(({matrix})|({pmatrix})|({bmatrix})|({Bmatrix})|({vmatrix})|({Vmatrix}))';
export function patternFactory(
  patternName: 'atom' | 'sScript' | 'matrix',
  fontSizes?: FontSizesType
) {
  if (patternName === 'atom')
    return new AtomPattern({
      name: patternName,
      regString: atom_letter + '|' + atom_number,
      lettRegStr: atom_letter,
      numRegStr: atom_number,
      fontSizes: fontSizes,
    });

  if (patternName === 'sScript')
    return new SscriptPattern({
      name: 'Sscirpt',
      regString: sscript_string,
      fontSizes: fontSizes,
    });
  if (patternName === 'matrix')
    return new MatrixPattern({
      name: 'matrix',
      regString: matrix_sring,
    });
  else throw new Error(`pattern name ${patternName} is not recognized!`);
}
