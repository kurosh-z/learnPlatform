import React from 'react';
import Sscript, { IndexString } from './Sscript';
import Text from './Text';
import mathsymbols from './mathsymbols';

const getStringWidth = mathsymbols.getStringWidth;
export type MathExpr = {
  expr: string;
  attr: { dx: number; dy: number; className: string };
};

export type PatternProps = {
  name: string;
  regString: string;
};

export abstract class Pattern {
  regString: string;
  name: string;
  abstract mathExpressions: MathExpr[];
  // abstract props: Object;
  abstract stratingIndex: number;
  abstract endingIndex: number;
  constructor(regString: string, name: string) {
    this.regString = regString;
    this.name = name;
  }
  abstract isPattern(expr: string): boolean;
  abstract strToMathExpr(str: string, startIdx?: number): void;
  abstract isParallel(): boolean;

  // abstract getComponent():
  //   | React.FC<any>
  //   | React.RefForwardingComponent<any, any>;
  // // abstract makeComponent: () => React.ReactElement;
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

  constructor({ regString, name }: PatternProps) {
    super(regString, name);
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
    let type1: IndexString['indexType'], type2: IndexString['indexType'];
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

    const mathExpressions: MathExpr[] = type2
      ? [
          {
            expr: base,
            attr: {
              dx: 0,
              dy: 0,
              className: 'base'
            }
          },

          {
            expr: indexStr1,
            attr: {
              dx: 0,
              dy: type1 === 'subscript' ? 12 : -12,
              className: type1
            }
          },
          {
            expr: indexStr2,
            attr: {
              dx: 0,
              dy: type2 === 'subscript' ? 12 : -12,
              className: type2
            }
          }
        ]
      : [
          {
            expr: base,
            attr: {
              dx: 0,
              dy: 0,
              className: 'base'
            }
          },
          {
            expr: indexStr1,
            attr: {
              dx: 0,
              dy: type1 === 'subscript' ? 12 : -12,
              className: type1
            }
          }
        ];
    this.mathExpressions = mathExpressions;
    // const props = {
    //   base: base,
    //   indexStrings: indexStrings
    // };
    // this.props = props;
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
  constructor({ regString, name }: PatternProps) {
    super(regString, name);
  }
  isParallel() {
    return false;
  }
  isPattern(str: string) {
    const regex = new RegExp(this.regString);
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
    const attr = { dx: 0, dy: 0, className: 'math_default' };
    const mathExpressions: MathExpr[] = [{ expr: atomExpr, attr: attr }];
    this.mathExpressions = mathExpressions;
    const props = { expr: atomExpr };
    this.props = props;
  }
}

const sscript_string = '([a-z0-9])((_{)|(^{))';
const atom_string = '[a-zA-Z@]+';
export function patternFactory(patternName: 'atom' | 'sScript') {
  if (patternName === 'atom')
    return new AtomPattern({ name: 'atom', regString: atom_string });
  if (patternName === 'sScript')
    return new SscriptPattern({ name: 'Sscirpt', regString: sscript_string });
  else throw new Error(`pattern name ${patternName} is not recognized!`);
}
