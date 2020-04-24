import Pattern, { PatternArgs } from './Pattern';

export type AnimExpr = {
  id: string;
  expr: string;
};
export default class AnimCompPattern extends Pattern {
  regString = `(\\\\anim)<(\\w+)>{`;
  // regString = `((_{)|(\\^{))|((_)|(\\^))`;
  //   reglong = `(\\\\foreingcomp)<(\\w+),([-+]?(\\d+.?\\d*)),([-+]?(\\d+.?\\d*)),([-+]?(\\d+.?\\d*)),([-+]?(\\d+.?\\d*))>`;

  stratingIndex: number;
  endingIndex: number;
  stringsRest: string;
  animExpr: AnimExpr;

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
    const regexp = new RegExp(this.regString, 'gm');
    const match = regexp.exec(str);
    const id = match[2];
    const openingBracket = /\{/gm.exec(str);
    const opneingIndex = openingBracket.index;
    const endingIndex = this.findmatchingPairs({
      str: str,
      startIdx: opneingIndex,
      openregStr: '{',
      closeregStr: '}',
    });
    const expr = str.slice(openingBracket.index + 1, endingIndex - 1);
    this.animExpr = {
      id: id,
      expr: expr,
    };

    this.stratingIndex = match.index;
    this.endingIndex = endingIndex;
    this.stringsRest = this.consume(str, this.endingIndex);
  }
}
