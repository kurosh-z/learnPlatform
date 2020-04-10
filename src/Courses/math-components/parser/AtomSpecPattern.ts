import Pattern, { MathExpr, PatternArgs } from './Pattern';

export default class AtomSpecPattern extends Pattern {
  mathExpressions: MathExpr[];
  stratingIndex: number;
  endingIndex: number;
  stringsRest: string;
  regString = `[\\(\\)\\[\\],=*]`;

  constructor({ name, fontSizes }: PatternArgs) {
    super({ name, fontSizes });
  }
  isPattern(str: string) {
    const regexp = new RegExp(this.regString, 'gm');
    return regexp.test(str);
  }
  isParallel() {
    return false;
  }
  strToMathExpr(str: string) {
    let expr = str[0];

    this.stratingIndex = 0;
    this.endingIndex = 1;
    let dx = 0;
    let dxx = 0;
    if (expr === '=') {
      const font_factor = this.fontSizes[this.fontKey];
      dx = 3 * font_factor;
      dxx = 3 * font_factor;
    }
    if (expr === ')') {
      const font_factor = this.fontSizes[this.fontKey];
      dx = 1.5 * font_factor;
    }

    this.mathExpressions = [
      {
        expr: expr,
        attr: {
          className: 'math_letter normal',
          fontKey: this.fontKey,
          dy: 0,
          dx,
          dxx,
        },
      },
    ];

    this.stringsRest = this.consume(str, this.endingIndex);
  }
}
