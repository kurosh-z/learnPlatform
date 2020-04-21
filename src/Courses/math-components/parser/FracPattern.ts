import Pattern, { PatternArgs } from './Pattern';

export type FractExprs = {
  numerator: string;
  denominator: string;
};
export default class FracPattern extends Pattern {
  regString = `(\\\\frac)`;
  // regString = `((_{)|(\\^{))|((_)|(\\^))`;
  //   reglong = `(\\\\foreingcomp)<(\\w+),([-+]?(\\d+.?\\d*)),([-+]?(\\d+.?\\d*)),([-+]?(\\d+.?\\d*)),([-+]?(\\d+.?\\d*))>`;

  stratingIndex: number;
  endingIndex: number;
  stringsRest: string;
  fracExprs: FractExprs;

  constructor({ name }: PatternArgs) {
    super({ name });
  }
  /* 
    test the given str for pattern
    */
  public isPattern(str: string) {
    const regexp = new RegExp(this.regString, 'gm');
    return regexp.test(str);
  }
  strToMathExpr(str: string) {
    const numOpneingIndex = 5;
    const numEndingIndex = this.findmatchingPairs({
      str: str,
      startIdx: numOpneingIndex,
      openregStr: '{',
      closeregStr: '}',
    });
    const numExpr = str.slice(numOpneingIndex + 1, numEndingIndex - 1);

    const denOpneingIndex = numEndingIndex;
    const denEndingIndex = this.findmatchingPairs({
      str: str,
      startIdx: denOpneingIndex,
      openregStr: '{',
      closeregStr: '}',
    });
    const denExpr = str.slice(denOpneingIndex + 1, denEndingIndex - 1);

    this.fracExprs = {
      numerator: numExpr,
      denominator: denExpr,
    };

    this.stratingIndex = 0;
    this.endingIndex = denEndingIndex;
    this.stringsRest = this.consume(str, this.endingIndex);
  }
}
