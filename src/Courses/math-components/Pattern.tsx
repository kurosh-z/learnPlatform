import { FontSizesType } from './MathCss';
const IDX_DY = 8;

export type IndexType = 'subscript' | 'supscript';
export type MathExpr = {
  expr: string;
  attr: {
    dx: number;
    dy: number;
    className: string;
    fontKey: keyof FontSizesType;
  };
};

export type PatternArgs = {
  name: string;
  regString: string;
  fontSizes: FontSizesType;
};
export abstract class Pattern {
  regString: PatternArgs['regString'];
  name: PatternArgs['name'];
  fontSizes: PatternArgs['fontSizes'];
  private _baseFont: keyof FontSizesType;
  abstract mathExpressions: MathExpr[];
  // abstract props: Object;
  abstract stratingIndex: number;
  abstract endingIndex: number;
  constructor({ regString, name, fontSizes }: PatternArgs) {
    this.regString = regString;
    this.name = name;
    this.fontSizes = fontSizes;
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
    startIdx = 0
  }: {
    openregStr: string;
    closeregStr: string;
    str: string;
    startIdx?: number;
  }) {
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
            return clMatch.index + 1;
          } else numOpen++; // if open is inside increase the numOpen
        } else return clMatch.index + 1; // if there is no open it should be a simple case a_{b}
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
  mathExpressions: MathExpr[];
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

    const regexp = new RegExp(this.regString, 'mg');
    const match = regexp.exec(str);
    if (!match)
      throw new Error(`math expresion dosen't containt ${this.name} pattern!`);
    const endIdx1 = this.findmatchingPairs({
      openregStr: '{',
      closeregStr: '}',
      str: str,
      startIdx: startIdx
    });
    let type1: IndexType, type2: IndexType;
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

    const indexStr1 = str.slice(startIdx + 3, endIdx1 - 1);
    let indexStr2: string;
    let startIdx2: number;
    let endIdx2: number;
    if (type2) {
      startIdx2 = endIdx1 + 2; //  _{...}^{...}
      endIdx2 = this.findmatchingPairs({
        openregStr: '{',
        closeregStr: '}',
        str: str,
        startIdx: endIdx1
      });
      indexStr2 = str.slice(startIdx2, endIdx2 - 1);
    }
    if (type2) this.isType2 = true;
    else this.isType2 = false;
    let indexFontKey: keyof FontSizesType;
    if (this.baseFont === 'scriptsize') indexFontKey = 'tiny';
    else if (this.baseFont === 'tiny') indexFontKey = 'tiny';
    else indexFontKey = 'scriptsize';
    const INDEX_DY = this.fontSizes[indexFontKey] * IDX_DY;
    const mathExpressions: MathExpr[] = type2
      ? [
          {
            expr: base,
            attr: {
              dx: 0,
              dy: 0,
              className: 'base',
              fontKey: this.baseFont
            }
          },

          {
            expr: indexStr1,
            attr: {
              dx: 0,
              dy: type1 === 'subscript' ? INDEX_DY : -INDEX_DY,
              className: type1 === 'subscript' ? 'sub' : 'sup',
              fontKey: indexFontKey
            }
          },
          {
            expr: indexStr2,
            attr: {
              dx: 0,
              dy: type2 === 'subscript' ? INDEX_DY : -INDEX_DY,
              className: type2 === 'subscript' ? 'sub' : 'sup',
              fontKey: indexFontKey
            }
          }
        ]
      : [
          {
            expr: base,
            attr: {
              dx: 0,
              dy: 0,
              className: 'base',
              fontKey: this.baseFont
            }
          },
          {
            expr: indexStr1,
            attr: {
              dx: 0,
              dy: type1 === 'subscript' ? INDEX_DY : -INDEX_DY,
              className: type1 === 'subscript' ? 'sub' : 'sup',
              fontKey: indexFontKey
            }
          }
        ];
    this.mathExpressions = mathExpressions;

    this.stratingIndex = startIdx;
    this.endingIndex = type2 ? endIdx2 : endIdx1;
  }
}

// '([a-z0-9])((_{)|(^{))'
export class AtomPattern extends Pattern {
  props: Object;
  mathExpressions: MathExpr[];
  stratingIndex: number;
  endingIndex: number;
  constructor({ regString, name, fontSizes }: PatternArgs) {
    super({ regString, name, fontSizes });
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
  findRange(expr: string) {
    let idx = 0;
    for (const char of expr) {
      if (this.isPattern(char)) idx++;
      else return expr[idx] === '_' || expr[idx] === '^' ? idx - 1 : idx;
    }
    return expr[idx] === '_' || expr[idx] === '^' ? idx - 1 : idx;
  }
  strToMathExpr(str: string, startIdx: number = 0) {
    const endingIndex = this.findRange(str);
    this.stratingIndex = startIdx;
    this.endingIndex = endingIndex;
    const atomExpr = str.slice(this.stratingIndex, this.endingIndex);
    const attr: MathExpr['attr'] = {
      dx: 0,
      dy: 0,
      className: this.name,
      fontKey: this.baseFont
    };
    const mathExpressions: MathExpr[] = [{ expr: atomExpr, attr: attr }];
    this.mathExpressions = mathExpressions;
  }
}
const allLetters = 'a-zA-Z@αβγΓδΔϵζηθΘιIκλΛμνοπΠρσΣτυϕΦχΞξψΨω';
const sscript_string = `([${allLetters}0-9])((_{)|(^{))`;
const atom_letter_string = `[${allLetters}]+`;
const atom_number_string = '([-+]?)(\\d+.?\\d*)';
export function patternFactory(
  patternName: 'math_letter' | 'math_number' | 'sScript',
  fontSizes: FontSizesType
) {
  if (patternName === 'math_letter' || patternName === 'math_number')
    return new AtomPattern({
      name: patternName,
      regString:
        patternName === 'math_letter' ? atom_letter_string : atom_number_string,
      fontSizes: fontSizes
    });

  if (patternName === 'sScript')
    return new SscriptPattern({
      name: 'Sscirpt',
      regString: sscript_string,
      fontSizes: fontSizes
    });
  else throw new Error(`pattern name ${patternName} is not recognized!`);
}
