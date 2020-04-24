import Pattern, { MathExpr, PatternArgs } from './Pattern';

export default class IntegralPattern extends Pattern {
  endingIndex: number;
  stratingIndex: number;
  regString = '(\\int)|()';
  mathExpressions: MathExpr[];
  stringsRest: string;
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

  strToMathExpr(str: string) {}
}
