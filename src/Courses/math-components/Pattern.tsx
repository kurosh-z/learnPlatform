import React from 'react';
import Sscript, { IndexString } from './Sscript';
import Text from './Text';
import mathsymbols from './mathsymbols';
const getStringWidth = mathsymbols.getStringWidth;
export type PatternProps = {
  name: string;
  regString: string;
};

export abstract class Pattern {
  regString: string;
  name: string;
  abstract props: Object;
  abstract stratingIndex: number;
  abstract endingIndex: number;
  constructor(regString: string, name: string) {
    this.regString = regString;
    this.name = name;
  }
  abstract isPattern(expr: string): boolean;
  abstract exprToProps(expr: string, startIdx?: number): void;
  abstract getComponent():
    | React.FC<any>
    | React.RefForwardingComponent<any, any>;
  // abstract makeComponent: () => React.ReactElement;
  findmatchingPairs({
    open,
    close,
    str,
    startIdx = 0
  }: {
    open: string;
    close: string;
    str: string;
    startIdx?: number;
  }) {
    const regOpen = new RegExp(open, 'gm');
    const regClose = new RegExp(close, 'gm');
    regOpen.lastIndex = startIdx;
    const match = regOpen.exec(str);
    regClose.lastIndex = regOpen.lastIndex;
    var numOpen = 1,
      numClose = 0;
    var clMatch: RegExpExecArray;
    var matchingCloseIndex: number;
    let flag = true;
    while (flag) {
      if (regOpen.exec(str)) numOpen++;
      clMatch = regClose.exec(str);
      if (clMatch) numClose++;
      if (numOpen - numClose !== 0 && !match)
        throw new Error('unbalanced paris: no closing match could be found');
      if (numOpen - numClose === 0) {
        matchingCloseIndex = clMatch.index;
        flag = false;
      }
    }
    return matchingCloseIndex + 1;
  }
}

export class SscriptPattern extends Pattern {
  props: Object;
  stratingIndex: number;
  endingIndex: number;

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

  exprToProps(expr: string, startIdx: number = 0) {
    const base = expr.slice(startIdx, startIdx + 1);

    const regexp = new RegExp(this.regString, 'mg');
    const match = regexp.exec(expr);
    if (!match)
      throw new Error(`math expresion dosen't containt ${this.name} pattern!`);
    const endIdx1 = this.findmatchingPairs({
      open: '{',
      close: '}',
      str: expr,
      startIdx: startIdx
    });
    let type1: IndexString['indexType'], type2: IndexString['indexType'];
    if (expr[startIdx + 1] === '_') type1 = 'subscript';
    else if (expr[startIdx + 1] === '^') type1 = 'supscript';
    else
      throw new Error(
        `Error at index ${startIdx} expected _{ or ^{ got ${expr.slice(
          startIdx + 1,
          startIdx + 3
        )}`
      );

    if (expr[endIdx1] === '_') {
      if (type1 === 'subscript')
        throw new Error(`double subscript at index ${endIdx1}`);
      else type2 = 'subscript';
    } else if (expr[endIdx1] === '^') {
      if (type1 === 'supscript')
        throw new Error(`double supscript at index ${endIdx1}`);
      else type2 = 'supscript';
    } else type2 = null;

    const indexStr1 = expr.slice(startIdx + 3, endIdx1 - 1);
    let indexStr2: string;
    let startIdx2: number;
    let endIdx2: number;
    if (type2) {
      startIdx2 = endIdx1 + 2; //  _{...}^{...}
      endIdx2 = this.findmatchingPairs({
        open: '{',
        close: '}',
        str: expr,
        startIdx: startIdx2
      });
      indexStr2 = expr.slice(startIdx2, endIdx2);
    }

    const indexStrings: IndexString[] = type2
      ? [
          { expr: indexStr1, indexType: type1 },
          { expr: indexStr2, indexType: type2 }
        ]
      : [{ expr: indexStr1, indexType: type1 }];

    const props = {
      base: base,
      indexStrings: indexStrings
    };
    this.props = props;
    this.stratingIndex = startIdx;
    this.endingIndex = type2 ? endIdx2 : endIdx1;
  }

  getComponent() {
    return Sscript;
  }
}

// '([a-z0-9])((_{)|(^{))'
export class AtomPattern extends Pattern {
  private static instance: AtomPattern;
  props: Object;
  stratingIndex: number;
  endingIndex: number;
  constructor({ regString, name }: PatternProps) {
    super(regString, name);
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
  exprToProps(expr: string, startIdx: number = 0) {
    const endingIndex = this.findRange(expr);
    this.stratingIndex = startIdx;
    this.endingIndex = endingIndex;
    const atomExpr = expr.slice(this.stratingIndex, this.endingIndex);

    const props = { expr: atomExpr };
    this.props = props;
  }
  // : React.FC<typeof this.props>
  getComponent() {
    return Text;
  }
}
