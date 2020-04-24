import Pattern, { MathExpr, PatternArgs } from './Pattern';
import { FONT_FAMILIES } from './fontMetrics';
// prettier-ignore
const SPECIAL_CHARS = {
  ')':()=>( { dx:0, dy: 0, dxx: 0, dyy: 0, className: ' normal math_letter' }),
  '(':(font_factor)=>( { dx: 0, dy: 0, dxx: 0, dyy: 0, className: 'normal math_letter' }),
  '=':(fontFactor:number)=>( { dx:fontFactor* 3, dy: 0, dxx: fontFactor*3, dyy: 0, className: ' normal math_letter' }),
  '[':(fontFactor:number)=>( { dx: 0, dy: 0, dxx: fontFactor*3, dyy: 0, className: ' normal math_letter' }),
  ']':(fontFactor:number)=>( { dx: 0, dy: 0, dxx:fontFactor* 3, dyy: 0, className: ' normal math_letter' }),
  // '{':(fontFactor:number)=>( { dx: 0, dy: 0, dxx: fontFactor*3, dyy: 0, className: 'normal' }),
  // '}':(fontFactor:number)=>( { dx: 0, dy: 0, dxx:fontFactor* 3, dyy: 0, className: 'normal' }),
  '∫':(fontFactor: number)=>( { dx: 0, dy: 0, dxx:fontFactor*5, dyy: 0, className: 'math_op' }),
  '∞':(font_factor)=>({ dx: 0, dy:1.5*font_factor , dxx: 0, dyy: -1.2*font_factor, className: 'normal math_letter' }),
  '∂':(font_factor)=>({ dx: 0, dy:0 , dxx: (-.2)*font_factor, dyy: 0, className: 'normal main' }),
  '-':(font_factor)=>({ dx: 0, dy: 0, dxx: 0, dyy: 0, className: 'math_letter normal' }),
  '+':(font_factor)=>({ dx: 1.3*font_factor, dy: 0, dxx:-1.3*font_factor, dyy: 0, className: 'math_letter normal' }),
  '×':(font_factor)=>({ dx: 2.5*font_factor, dy: 0, dxx: 2.5*font_factor, dyy: 0, className: ' normal math_letter' }),
  ',':()=>( { dx: 0, dy: 0, dxx: 0, dyy: 0, className: 'normal' }),
  '.':()=>( { dx: 0, dy: 0, dxx: 0, dyy: 0, className: 'normal' }),
  '′':(font_factor)=>( { dx: 1*font_factor, dy: -1.5*font_factor, dxx: -1.8*font_factor, dyy: 1.5*font_factor, className: 'normal math_letter' }),
  '′′':(font_factor)=>( { dx: 1*font_factor, dy: -1.5*font_factor, dxx: -1.8*font_factor, dyy: 1.5*font_factor, className: 'normal math_letter' }),

  
};
export default class AtomSpecPattern extends Pattern {
  mathExpressions: MathExpr[];
  stratingIndex: number;
  endingIndex: number;
  stringsRest: string;
  // private _isMathOp: boolean;
  regString = `['.\\(\\)\\[\\]∞,=∂∫+×-]`;

  constructor({ name, getFontSize }: PatternArgs) {
    super({ name, getFontSize });
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
    var fontFamily: FONT_FAMILIES = 'KaTex_Main';
    var font_factor: number;

    if (expr === "'") {
      expr = '′';
    }
    if (str.slice(0, 2) === "''") {
      expr = '′′';
      this.endingIndex += 1;
    }
    if (expr === '∫') {
      font_factor = this.getFontSize({
        type: 'math_op',
        sizeKey: this.fontKey,
      });

      if (this.fontKey === 'scriptsize' || this.fontKey === 'tiny') {
        fontFamily = 'KaTeX_Size1';
      } else {
        fontFamily = 'KaTeX_Size2';
      }
    } else {
      font_factor = this.getFontSize({
        type: 'main',
        sizeKey: this.fontKey,
      });
    }

    const { dx, dy, dxx, dyy, className } = SPECIAL_CHARS[expr](font_factor);

    this.mathExpressions = [
      {
        expr: expr,
        attr: {
          fontKey: this.fontKey,
          fontFamily: fontFamily,
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
