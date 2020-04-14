import { FontSizeFunc, FONTSIZES } from './MathCss';
import { FONT_FAMILIES, FONT_STYLES } from './fontMetrics';
export const LETTERS = 'a-zA-Z@αβγΓδΔϵζηθΘιIκλΛμνοπΠρσΣτυϕΦχΞξψΨω';

export type MathExpr = {
  expr: string;
  attr: {
    dx: number; // dx, dy used for before character gets printed
    dxx?: number; // dxx & dyy used for after character gets printed
    dy: number;
    dyy?: number;
    className: string;
    fontKey: keyof FONTSIZES;
    fontStyle?: FONT_STYLES;
    fontFamily?: FONT_FAMILIES;
  };
};

export type PatternArgs = {
  name: string;
  getFontSize?: FontSizeFunc;
};
export default abstract class Pattern {
  abstract regString: string;
  abstract stringsRest: string;
  name: PatternArgs['name'];
  getFontSize?: PatternArgs['getFontSize'];
  fontKey?: keyof FONTSIZES = 'normalsize';
  mathExpressions?: MathExpr[];

  // abstract props: Object;
  abstract stratingIndex: number;
  abstract endingIndex: number;
  constructor({ name, getFontSize }: PatternArgs) {
    this.name = name;
    if (getFontSize) {
      this.getFontSize = getFontSize;
    }
  }
  abstract isPattern(expr: string): boolean;
  abstract strToMathExpr(str: string, startIdx?: number): void;

  consume(expr: string, startingIndex: number) {
    const reducedExpr = expr.slice(startingIndex, expr.length);
    return reducedExpr;
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
        throw new Error(
          `founding pairs reached the maximum number of iteration!`
        );
      }
    }
  }
}
