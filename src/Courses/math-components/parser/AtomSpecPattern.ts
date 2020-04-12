import Pattern, { MathExpr, PatternArgs } from './Pattern';

// prettier-ignore
const SPECIAL_CHARS = {
  ')':()=>( { dx:0, dy: 0, dxx: 0, dyy: 0, className: 'math_letter normal' }),
  '(':()=>( { dx: 0, dy: 0, dxx: 0, dyy: 0, className: 'math_letter normal' }),
  '=':(fontFactor:number)=>( { dx:fontFactor* 3, dy: 0, dxx: fontFactor*3, dyy: 0, className: 'math_letter normal' }),
  '[':(fontFactor:number)=>( { dx: 0, dy: 0, dxx: fontFactor*3, dyy: 0, className: 'math_letter normal' }),
  ']':(fontFactor:number)=>( { dx: 0, dy: 0, dxx:fontFactor* 3, dyy: 0, className: 'math_letter normal' }),
  '∫':(fontFactor: number)=>( { dx: 0, dy: 0, dxx:fontFactor*12.5, dyy: 0, className: 'math_op' }),
  ',':()=>( { dx: 0, dy: 0, dxx: 0, dyy: 0, className: 'math_letter normal' }),
};
export default class AtomSpecPattern extends Pattern {
  mathExpressions: MathExpr[];
  stratingIndex: number;
  endingIndex: number;
  stringsRest: string;
  private _isMathOp: boolean;
  regString = `[\\(\\)\\[\\],=∫]`;

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

    const font_factor = this.fontSizes[this.fontKey];

    const { dx, dy, dxx, dyy, className } = SPECIAL_CHARS[expr](font_factor);

    this.mathExpressions = [
      {
        expr: expr,
        attr: {
          fontKey: this.fontKey,
          fontFamily: expr === '∫' ? 'KaTeX_Size2' : 'KaTex_Main',
          fontStyle: 'normal',
          dx,
          dy,
          dxx,
          dyy,
          className,
        },
      },
    ];

    this.stringsRest = this.consume(str, this.endingIndex);
  }
}
